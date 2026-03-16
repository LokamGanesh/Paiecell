# PhonePe Payment Gateway Integration

## Overview
The PAIE Cell platform now integrates PhonePe payment gateway for student registration. Students must complete a ₹100 payment during registration to activate their account.

## Registration Flow

### Step 1: User Registration Form
- User fills in all required details (name, email, phone, college, department, year)
- User sets password and confirms it
- User clicks "Create Account & Pay ₹100"

### Step 2: Account Creation
- Backend creates a user account with `paymentStatus: 'pending'`
- Backend initiates PhonePe payment with ₹100 amount
- User is redirected to PhonePe payment gateway

### Step 3: Payment Processing
- User completes payment on PhonePe
- PhonePe redirects user back to the app with transaction ID

### Step 4: Payment Verification
- Backend verifies payment with PhonePe API
- If successful:
  - User account is activated (`isPaymentVerified: true`)
  - `paymentStatus` is set to 'completed'
  - JWT token is generated
  - Welcome email is sent
  - User is redirected to dashboard
- If failed:
  - `paymentStatus` is set to 'failed'
  - User is shown error message
  - User can retry registration

## Backend Setup

### Environment Variables
Add these to your `.env` file:

```
# PhonePe Payment Gateway
PHONEPE_ENV=sandbox  # Use 'sandbox' for testing, 'production' for live
PHONEPE_MERCHANT_ID=your-merchant-id
PHONEPE_SALT_KEY=your-salt-key
PHONEPE_SALT_INDEX=1
BACKEND_URL=http://localhost:5000
```

### Getting PhonePe Credentials

1. Visit [PhonePe Business](https://business.phonepe.com)
2. Sign up and create a merchant account
3. Go to Settings → API Keys
4. Copy your Merchant ID and Salt Key
5. Use these in your `.env` file

### Database Changes

User model now includes:
- `isPaymentVerified`: Boolean (default: false)
- `paymentId`: String (PhonePe transaction ID)
- `transactionId`: String (Merchant transaction ID)
- `paymentAmount`: Number (Amount paid in rupees)
- `paymentStatus`: String (pending, completed, failed)

### API Endpoints

#### 1. POST `/api/auth/register`
Creates a user and initiates payment.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "college": "SRKR Engineering College",
  "department": "CSE",
  "year": "1st Year"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created. Redirecting to payment gateway...",
  "paymentUrl": "https://mercury-uat.phonepe.com/...",
  "merchantTransactionId": "PAIE_1234567890_john",
  "userId": "user_id_here"
}
```

#### 2. POST `/api/auth/payment-callback`
Verifies payment and activates user account.

**Request:**
```json
{
  "merchantTransactionId": "PAIE_1234567890_john",
  "userId": "user_id_here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified and registration completed",
  "user": { ... },
  "token": "jwt_token_here"
}
```

**Response (Failed):**
```json
{
  "success": false,
  "error": "Payment verification failed. Please try again."
}
```

#### 3. GET `/api/auth/payment-status/:transactionId`
Check payment status.

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

## Frontend Implementation

### SignupDialog Component
- Updated to show registration fee information
- Redirects to PhonePe payment gateway after form submission
- Stores user data in sessionStorage for callback

### PaymentCallback Page
- Handles payment verification
- Shows loading state during verification
- Shows success message and redirects to dashboard on success
- Shows error message and retry option on failure
- Clears sessionStorage after completion

### Routes
- `/payment-callback` - Payment verification page

## Testing

### Sandbox Testing
1. Set `PHONEPE_ENV=sandbox` in `.env`
2. Use test credentials from PhonePe
3. Complete registration form
4. Use PhonePe test payment methods

### Test Payment Methods
PhonePe provides test cards and UPI IDs for sandbox testing. Check their documentation for current test credentials.

### Manual Testing Steps
1. Go to registration page
2. Fill in all details
3. Click "Create Account & Pay ₹100"
4. Complete payment on PhonePe
5. Verify payment callback page shows success
6. Check user account is created with `isPaymentVerified: true`
7. Verify welcome email is sent

## Security Features

1. **Checksum Verification**: All requests to PhonePe include SHA256 checksum
2. **Server-side Verification**: Payment is verified on backend before activating account
3. **Transaction ID Validation**: Unique transaction IDs prevent duplicate payments
4. **Email Verification**: Welcome email confirms successful registration
5. **Token Generation**: JWT token issued only after payment verification

## Error Handling

### Common Errors

**"Payment verification failed"**
- PhonePe API returned failure status
- User should retry payment
- Check PhonePe merchant account for issues

**"Invalid payment session"**
- SessionStorage data was cleared
- User should restart registration
- Check browser console for errors

**"Server error during payment verification"**
- Backend error occurred
- Check server logs
- Contact support if issue persists

## Production Deployment

### Before Going Live

1. Update `PHONEPE_ENV=production` in `.env`
2. Use production merchant credentials
3. Update `FRONTEND_URL` and `BACKEND_URL` to production URLs
4. Test payment flow end-to-end
5. Set up monitoring and logging
6. Configure email notifications

### Production Considerations

- Use HTTPS for all URLs
- Implement rate limiting on payment endpoints
- Set up payment reconciliation job
- Monitor failed payments
- Implement retry logic for failed payments
- Set up alerts for payment anomalies

## Troubleshooting

### Payment Gateway Not Loading
- Check `PHONEPE_MERCHANT_ID` is correct
- Verify `PHONEPE_ENV` setting
- Check network connectivity
- Clear browser cache

### Payment Verification Fails
- Verify `PHONEPE_SALT_KEY` is correct
- Check transaction ID format
- Verify PhonePe API is accessible
- Check server logs for detailed errors

### User Not Redirected After Payment
- Check `FRONTEND_URL` in `.env`
- Verify payment callback route exists
- Check browser console for errors
- Verify sessionStorage is not cleared

## Future Enhancements

- Multiple payment options (Razorpay, Stripe)
- Refund management
- Payment history dashboard
- Subscription-based payments
- Bulk payment processing
- Payment analytics and reporting
