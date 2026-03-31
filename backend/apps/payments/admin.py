from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ('student', 'course', 'amount', 'status', 'razorpay_payment_id', 'created_at')
    list_filter   = ('status',)
    search_fields = ('student__email', 'course__title', 'razorpay_payment_id')
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'created_at')
