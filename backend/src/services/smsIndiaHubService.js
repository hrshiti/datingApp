import axios from 'axios';

/**
 * SMSIndia Hub SMS Service for Dating App
 * Handles OTP sending via SMSIndia Hub API
 */
class SMSIndiaHubService {
  constructor() {
    this.apiKey = process.env.SMSINDIAHUB_API_KEY;
    this.senderId = process.env.SMSINDIAHUB_SENDER_ID;
    this.baseUrl = 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
    
    if (!this.apiKey || !this.senderId) {
      console.warn('SMSIndia Hub credentials not configured. SMS functionality will be disabled.');
    }
  }

  /**
   * Check if SMSIndia Hub is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    // Load credentials dynamically in case they weren't available during construction
    const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
    const senderId = this.senderId || process.env.SMSINDIAHUB_SENDER_ID;
    
    return !!(apiKey && senderId);
  }

  /**
   * Normalize phone number to Indian format with country code
   * @param {string} phone - Phone number to normalize
   * @param {string} countryCode - Country code (e.g., +91)
   * @returns {string} - Normalized phone number with country code (91XXXXXXXXXX)
   */
  normalizePhoneNumber(phone, countryCode = '+91') {
    // Remove all non-digit characters
    const digits = phone.replace(/[^0-9]/g, '');
    
    // Remove country code if present
    let phoneDigits = digits;
    if (countryCode) {
      const codeDigits = countryCode.replace(/[^0-9]/g, '');
      if (phoneDigits.startsWith(codeDigits)) {
        phoneDigits = phoneDigits.substring(codeDigits.length);
      }
    }
    
    // If it already has country code 91 and is 12 digits, return as is
    if (digits.startsWith('91') && digits.length === 12) {
      return digits;
    }
    
    // If it's 10 digits, add country code 91
    if (phoneDigits.length === 10) {
      return '91' + phoneDigits;
    }
    
    // If it's 11 digits and starts with 0, remove the 0 and add country code
    if (phoneDigits.length === 11 && phoneDigits.startsWith('0')) {
      return '91' + phoneDigits.substring(1);
    }
    
    // Return with country code as fallback
    return '91' + phoneDigits.slice(-10);
  }

  /**
   * Send OTP via SMS using SMSIndia Hub
   * @param {string} phone - Phone number to send SMS to
   * @param {string} otp - OTP code to send
   * @param {string} countryCode - Country code (default: +91)
   * @returns {Promise<Object>} - Response object
   */
  async sendOTP(phone, otp, countryCode = '+91') {
    try {
      // Load credentials dynamically
      const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this.senderId || process.env.SMSINDIAHUB_SENDER_ID;
      
      if (!apiKey || !senderId) {
        throw new Error('SMSIndia Hub not configured. Please check your environment variables.');
      }

      const normalizedPhone = this.normalizePhoneNumber(phone, countryCode);
      
      // Validate phone number (should be 12 digits with country code)
      if (normalizedPhone.length !== 12 || !normalizedPhone.startsWith('91')) {
        throw new Error(`Invalid phone number format: ${phone}. Expected 10-digit Indian mobile number.`);
      }

      // Use the exact template that works with SMSIndiaHub
      const message = `Welcome to DatingApp powered by SMSINDIAHUB. Your OTP for registration is ${otp}. Valid for 10 minutes.`;
      
      // Build the API URL with query parameters
      const params = new URLSearchParams({
        APIKey: apiKey,
        msisdn: normalizedPhone,
        sid: senderId,
        msg: message,
        fl: '0', // Flash message flag (0 = normal SMS)
        dc: '0', // Delivery confirmation (0 = no confirmation)
        gwid: '2' // Gateway ID (2 = transactional)
      });

      const apiUrl = `${this.baseUrl}?${params.toString()}`;

      // Make GET request to SMSIndia Hub API
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'DatingApp/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000 // 15 second timeout
      });

      console.log('SMSIndia Hub Response Status:', response.status);
      console.log('SMSIndia Hub Response Data:', response.data);

      // SMSIndia Hub returns JSON response
      const responseData = response.data;
      
      // Check for success indicators in the response
      if (responseData.ErrorCode === '000' && responseData.ErrorMessage === 'Done') {
        const messageId = responseData.MessageData && responseData.MessageData[0] 
          ? responseData.MessageData[0].MessageId 
          : `sms_${Date.now()}`;
          
        return {
          success: true,
          messageId: messageId,
          jobId: responseData.JobId,
          status: 'sent',
          to: normalizedPhone,
          body: message,
          provider: 'SMSIndia Hub',
          response: responseData
        };
      } else if (responseData.ErrorCode && responseData.ErrorCode !== '000') {
        throw new Error(`SMSIndia Hub API error: ${responseData.ErrorMessage} (Code: ${responseData.ErrorCode})`);
      } else {
        // Fallback for unexpected response format
        return {
          success: true,
          messageId: `sms_${Date.now()}`,
          status: 'sent',
          to: normalizedPhone,
          body: message,
          provider: 'SMSIndia Hub',
          response: responseData
        };
      }

    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        const errorData = error.response.data;
        
        if (error.response.status === 401) {
          throw new Error('SMSIndia Hub authentication failed. Please check your API key.');
        } else if (error.response.status === 400) {
          throw new Error(`SMSIndia Hub request error: Invalid request parameters`);
        } else if (error.response.status === 429) {
          throw new Error('SMSIndia Hub rate limit exceeded. Please try again later.');
        } else if (error.response.status === 500) {
          throw new Error('SMSIndia Hub server error. Please try again later.');
        } else {
          throw new Error(`SMSIndia Hub API error (${error.response.status}): ${errorData}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('SMSIndia Hub request timeout. Please try again.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to SMSIndia Hub service. Please check your internet connection.');
      } else if (error.code === 'ECONNRESET') {
        throw new Error('SMSIndia Hub connection was reset. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Send custom SMS message
   * @param {string} phone - Phone number to send SMS to
   * @param {string} message - Custom message to send
   * @param {string} countryCode - Country code (default: +91)
   * @returns {Promise<Object>} - Response object
   */
  async sendCustomSMS(phone, message, countryCode = '+91') {
    try {
      // Load credentials dynamically
      const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this.senderId || process.env.SMSINDIAHUB_SENDER_ID;
      
      if (!apiKey || !senderId) {
        throw new Error('SMSIndia Hub not configured. Please check your environment variables.');
      }

      const normalizedPhone = this.normalizePhoneNumber(phone, countryCode);
      
      // Validate phone number (should be 12 digits with country code)
      if (normalizedPhone.length !== 12 || !normalizedPhone.startsWith('91')) {
        throw new Error(`Invalid phone number format: ${phone}. Expected 10-digit Indian mobile number.`);
      }

      // Build the API URL with query parameters
      const params = new URLSearchParams({
        APIKey: apiKey,
        msisdn: normalizedPhone,
        sid: senderId,
        msg: message,
        fl: '0', // Flash message flag (0 = normal SMS)
        dc: '0', // Delivery confirmation (0 = no confirmation)
        gwid: '2' // Gateway ID (2 = transactional)
      });

      const apiUrl = `${this.baseUrl}?${params.toString()}`;

      // Make GET request to SMSIndia Hub API
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'DatingApp/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 15000 // 15 second timeout
      });

      const responseText = response.data.toString();
      
      // Check for success indicators in the response
      if (responseText.includes('success') || responseText.includes('sent') || responseText.includes('accepted')) {
        return {
          success: true,
          messageId: `sms_${Date.now()}`,
          status: 'sent',
          to: normalizedPhone,
          body: message,
          provider: 'SMSIndia Hub',
          response: responseText
        };
      } else if (responseText.includes('error') || responseText.includes('failed') || responseText.includes('invalid')) {
        throw new Error(`SMSIndia Hub API error: ${responseText}`);
      } else {
        return {
          success: true,
          messageId: `sms_${Date.now()}`,
          status: 'sent',
          to: normalizedPhone,
          body: message,
          provider: 'SMSIndia Hub',
          response: responseText
        };
      }

    } catch (error) {
      throw error;
    }
  }

  /**
   * Get account balance from SMSIndia Hub
   * @returns {Promise<Object>} - Balance information
   */
  async getBalance() {
    try {
      // Load credentials dynamically
      const apiKey = this.apiKey || process.env.SMSINDIAHUB_API_KEY;
      
      if (!apiKey) {
        throw new Error('SMSIndia Hub not configured.');
      }

      // SMSIndia Hub balance API endpoint
      const balanceUrl = `http://cloud.smsindiahub.in/vendorsms/checkbalance.aspx?APIKey=${apiKey}`;
      
      const response = await axios.get(balanceUrl, {
        headers: {
          'User-Agent': 'DatingApp/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });

      const responseText = response.data.toString();

      // Parse balance from response (SMSIndia Hub typically returns balance as text)
      const balanceMatch = responseText.match(/(\d+\.?\d*)/);
      const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

      return {
        success: true,
        balance: balance,
        currency: 'INR',
        response: responseText
      };
    } catch (error) {
      throw new Error(`Failed to fetch SMSIndia Hub balance: ${error.message}`);
    }
  }
}

// Create singleton instance
const smsIndiaHubService = new SMSIndiaHubService();

export default smsIndiaHubService;

