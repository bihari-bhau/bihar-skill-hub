from django.urls import path
from .views import CreateOrderView, VerifyPaymentView, PaymentFailedView, MyPaymentsView

urlpatterns = [
    path('create-order/', CreateOrderView.as_view(),  name='create-order'),
    path('verify/',       VerifyPaymentView.as_view(), name='verify-payment'),
    path('failed/',       PaymentFailedView.as_view(), name='payment-failed'),
    path('my/',           MyPaymentsView.as_view(),    name='my-payments'),
]
