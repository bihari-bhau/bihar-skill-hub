from django.db import models
from apps.users.models import User
from apps.courses.models import Course


class Payment(models.Model):
    PENDING   = 'pending'
    SUCCESS   = 'success'
    FAILED    = 'failed'
    REFUNDED  = 'refunded'
    STATUS_CHOICES = [
        (PENDING,  'Pending'),
        (SUCCESS,  'Success'),
        (FAILED,   'Failed'),
        (REFUNDED, 'Refunded'),
    ]

    student          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    course           = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='payments')
    razorpay_order_id   = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature  = models.CharField(max_length=200, blank=True, null=True)
    amount           = models.DecimalField(max_digits=8, decimal_places=2)  # in INR
    status           = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.full_name} → {self.course.title} [{self.status}]"
