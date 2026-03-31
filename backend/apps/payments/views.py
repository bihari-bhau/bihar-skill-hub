"""
Payments App — Razorpay Integration
====================================
HOW TO USE:
1. Add your Razorpay keys to Railway Variables:
   RAZORPAY_KEY_ID     = your key id
   RAZORPAY_KEY_SECRET = your key secret

2. For TEST mode:  use rzp_test_XXXXX keys
   For LIVE mode:  use rzp_live_XXXXX keys
"""

import os
import hmac
import hashlib
import razorpay
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.courses.models import Course
from apps.enrollments.models import Enrollment
from .models import Payment

# ─────────────────────────────────────────────────────────────────────────────
# ⚙️  RAZORPAY KEYS — Set these in Railway Variables or backend/.env file
# ─────────────────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID     = os.environ.get('RAZORPAY_KEY_ID',     'rzp_test_REPLACE_WITH_YOUR_KEY_ID')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'REPLACE_WITH_YOUR_KEY_SECRET')
# ─────────────────────────────────────────────────────────────────────────────

def get_razorpay_client():
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class CreateOrderView(APIView):
    """
    POST /api/payments/create-order/
    Creates a Razorpay order for a course enrollment.
    Frontend calls this first, then opens Razorpay checkout.
    """

    def post(self, request):
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(pk=course_id, status='published')
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Free course — enroll directly without payment
        if course.is_free:
            enrollment, _ = Enrollment.objects.get_or_create(
                student=request.user,
                course=course,
                defaults={'status': Enrollment.ACTIVE}
            )
            return Response({
                'free': True,
                'message': 'Enrolled successfully in free course!',
                'enrollment_id': enrollment.id,
            })

        # Check if already enrolled
        if Enrollment.objects.filter(student=request.user, course=course, status=Enrollment.ACTIVE).exists():
            return Response({'error': 'Already enrolled in this course.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Razorpay order
        amount_paise = int(float(course.price) * 100)  # Razorpay uses paise (1 INR = 100 paise)
        try:
            client = get_razorpay_client()
            order = client.order.create({
                'amount':   amount_paise,
                'currency': 'INR',
                'receipt':  f'course_{course_id}_user_{request.user.id}',
                'notes': {
                    'course_id':   str(course_id),
                    'course_name': course.title,
                    'student_id':  str(request.user.id),
                    'student_email': request.user.email,
                }
            })
        except Exception as e:
            return Response({'error': f'Payment gateway error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save pending payment record
        Payment.objects.create(
            student=request.user,
            course=course,
            razorpay_order_id=order['id'],
            amount=course.price,
            status=Payment.PENDING,
        )

        return Response({
            'order_id':   order['id'],
            'amount':     amount_paise,
            'currency':   'INR',
            'course_name': course.title,
            'student_name': request.user.full_name,
            'student_email': request.user.email,
            # ⚠️ KEY_ID is sent to frontend (safe — it's public)
            # KEY_SECRET is never sent to frontend
            'key_id':     RAZORPAY_KEY_ID,
        })


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Verifies Razorpay payment signature after checkout completes.
    Enrolls student if payment is valid.
    """

    def post(self, request):
        razorpay_order_id   = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature  = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'error': 'Missing payment details.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify signature using HMAC SHA256
        # ─────────────────────────────────────────────────────────────────
        # ⚙️  KEY_SECRET is used here for verification (server side only)
        # ─────────────────────────────────────────────────────────────────
        try:
            msg       = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected  = hmac.new(
                RAZORPAY_KEY_SECRET.encode('utf-8'),
                msg.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(expected, razorpay_signature):
                return Response({'error': 'Invalid payment signature. Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Verification error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Update payment record
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature  = razorpay_signature
            payment.status = Payment.SUCCESS
            payment.save()
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Auto-enroll student
        enrollment, _ = Enrollment.objects.get_or_create(
            student=payment.student,
            course=payment.course,
            defaults={'status': Enrollment.ACTIVE}
        )
        if enrollment.status != Enrollment.ACTIVE:
            enrollment.status = Enrollment.ACTIVE
            enrollment.save()

        return Response({
            'success': True,
            'message': f'Payment successful! You are now enrolled in {payment.course.title}.',
            'enrollment_id': enrollment.id,
            'payment_id': payment.razorpay_payment_id,
        })


class PaymentFailedView(APIView):
    """POST /api/payments/failed/ — Mark payment as failed"""

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        if order_id:
            Payment.objects.filter(razorpay_order_id=order_id).update(status=Payment.FAILED)
        return Response({'message': 'Payment marked as failed.'})


class MyPaymentsView(APIView):
    """GET /api/payments/my/ — Student views their payment history"""

    def get(self, request):
        payments = Payment.objects.filter(student=request.user).select_related('course')
        data = [{
            'id':           p.id,
            'course':       p.course.title,
            'amount':       str(p.amount),
            'status':       p.status,
            'payment_id':   p.razorpay_payment_id,
            'created_at':   p.created_at,
        } for p in payments]
        return Response(data)
