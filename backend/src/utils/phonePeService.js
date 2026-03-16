import crypto from 'crypto';
import axios from 'axios';

const PHONEPE_HOST_URL = process.env.PHONEPE_ENV === 'production' 
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://mercury-uat.phonepe.com/apis/hermes';

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

const generateChecksum = (payload, saltKey) => {
  const payloadString = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadString).toString('base64');
  const checksum = crypto
    .createHash('sha256')
    .update(base64Payload + saltKey)
    .digest('hex');
  return checksum;
};

export const initiatePayment = async (userData, amount = 100) => {
  try {
    if (!MERCHANT_ID || !SALT_KEY) {
      throw new Error('PhonePe credentials not configured. Please check your environment variables.');
    }

    const merchantTransactionId = `PAIE_${Date.now()}_${userData.email.split('@')[0]}`;
    const merchantUserId = userData._id ? userData._id.toString() : userData.email;
    
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId,
      amount: amount * 100, // Convert to paise
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-callback?transactionId=${merchantTransactionId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/payment-callback`,
      mobileNumber: userData.phone,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const checksum = generateChecksum(payload, SALT_KEY);
    
    console.log('Initiating PhonePe payment with URL:', PHONEPE_HOST_URL);
    console.log('Merchant ID:', MERCHANT_ID);
    
    const response = await axios.post(
      `${PHONEPE_HOST_URL}/pg/v1/pay`,
      {
        request: Buffer.from(JSON.stringify(payload)).toString('base64')
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###${SALT_INDEX}`
        }
      }
    );

    console.log('PhonePe response:', response.data);

    return {
      success: true,
      data: response.data,
      merchantTransactionId
    };
  } catch (error) {
    console.error('PhonePe payment initiation error:', error.response?.data || error.message);
    throw new Error(`Failed to initiate payment: ${error.response?.data?.message || error.message}`);
  }
};

export const verifyPayment = async (merchantTransactionId) => {
  try {
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId
    };

    const checksum = generateChecksum(payload, SALT_KEY);

    const response = await axios.get(
      `${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': `${checksum}###${SALT_INDEX}`,
          'X-MERCHANT-ID': MERCHANT_ID
        }
      }
    );

    return {
      success: response.data.success,
      data: response.data
    };
  } catch (error) {
    console.error('PhonePe payment verification error:', error);
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
};
