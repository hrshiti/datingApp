// Using native fetch API (available in Node.js 18+)
// No need for axios dependency

/**
 * SMSIndia Hub SMS Service for Dating App
 * Handles OTP sending via SMSIndia Hub API
 */
class SMSIndiaHubService {
  constructor() {
    // Don't load env vars in constructor - load them lazily when needed
    // This ensures dotenv.config() has been called first
    this.baseUrl = 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
    this._apiKey = null;
    this._senderId = null;
    this._initialized = false;
  }

  /**
   * Initialize credentials from environment variables
   * Called lazily to ensure dotenv.config() has run
   */
  _initialize() {
    if (this._initialized) return;
    
    this._apiKey = process.env.SMSINDIAHUB_API_KEY;
    this._senderId = process.env.SMSINDIAHUB_SENDER_ID;
    this._initialized = true;
    
    console.log('🔍 SMSIndia Hub Configuration Check:');
    console.log('   API Key:', this._apiKey ? `${this._apiKey.substring(0, 5)}...` : 'NOT SET');
    console.log('   Sender ID:', this._senderId || 'NOT SET');
    
    if (!this._apiKey || !this._senderId) {
      console.warn('⚠️ SMSIndia Hub credentials not configured. SMS functionality will be disabled.');
      console.warn('   Please set SMSINDIAHUB_API_KEY and SMSINDIAHUB_SENDER_ID in your .env file');
    } else {
      console.log('✅ SMSIndia Hub credentials found. SMS functionality enabled.');
    }
  }

  /**
   * Get API key (lazy initialization)
   */
  get apiKey() {
    this._initialize();
    return this._apiKey;
  }

  /**
   * Get sender ID (lazy initialization)
   */
  get senderId() {
    this._initialize();
    return this._senderId;
  }

  /**
   * Check if SMSIndia Hub is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    // Initialize if not already done
    this._initialize();
    
    // Check if credentials are available
    const isConfigured = !!(this._apiKey && this._senderId);
    
    if (!isConfigured) {
      console.log('⚠️ SMSIndia Hub not configured - checking env vars:');
      console.log('   SMSINDIAHUB_API_KEY:', process.env.SMSINDIAHUB_API_KEY ? 'EXISTS' : 'MISSING');
      console.log('   SMSINDIAHUB_SENDER_ID:', process.env.SMSINDIAHUB_SENDER_ID ? 'EXISTS' : 'MISSING');
    }
    
    return isConfigured;
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
      // Initialize credentials (lazy loading)
      this._initialize();
      
      // Load credentials
      const apiKey = this._apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this._senderId || process.env.SMSINDIAHUB_SENDER_ID;
      
      if (!apiKey || !senderId) {
        throw new Error('SMSIndia Hub not configured. Please check your environment variables.');
      }

      const normalizedPhone = this.normalizePhoneNumber(phone, countryCode);
      
      console.log(`📱 Normalized phone number: ${normalizedPhone} (from input: ${phone} with code: ${countryCode})`);
      
      // Validate phone number (should be 12 digits with country code)
      if (normalizedPhone.length !== 12 || !normalizedPhone.startsWith('91')) {
        throw new Error(`Invalid phone number format: ${phone}. Expected 10-digit Indian mobile number.`);
      }

      // Use the exact template that works with SMSIndiaHub (from CreateBharat)
      const message = `Welcome to the DatingApp powered by SMSINDIAHUB. Your OTP for registration is ${otp}`;
      
      console.log(`📨 SMS Message: ${message}`);
      console.log(`📞 Sending to: ${normalizedPhone}`);
      
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

      // Make GET request to SMSIndia Hub API using native fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'DatingApp/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('SMSIndia Hub request timeout. Please try again.');
        }
        throw new Error('Unable to connect to SMSIndia Hub service. Please check your internet connection.');
      }

      console.log('SMSIndia Hub Response Status:', response.status);
      
      // Get response as text first (SMSIndiaHub may return JSON or text)
      const responseText = await response.text();
      console.log('SMSIndia Hub Response Text (raw):', responseText.substring(0, 500)); // Log first 500 chars
      
      // Check if response is OK (HTTP status)
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('SMSIndia Hub authentication failed. Please check your API key.');
        } else if (response.status === 400) {
          throw new Error('SMSIndia Hub request error: Invalid request parameters');
        } else if (response.status === 429) {
          throw new Error('SMSIndia Hub rate limit exceeded. Please try again later.');
        } else if (response.status === 500) {
          throw new Error('SMSIndia Hub server error. Please try again later.');
        } else {
          throw new Error(`SMSIndia Hub API error (${response.status}): ${responseText.substring(0, 200)}`);
        }
      }
      
      // Try to parse as JSON, fallback to text if it fails
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('SMSIndia Hub Response Data (parsed JSON):', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        // If not JSON, treat as text response
        console.log('SMSIndia Hub Response is not JSON, treating as text');
        responseData = responseText;
      }
      
      // Check for success indicators in the response
      // Handle both JSON object and text response
      if (typeof responseData === 'object' && responseData !== null) {
        // JSON response
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
          throw new Error(`SMSIndia Hub API error: ${responseData.ErrorMessage || 'Unknown error'} (Code: ${responseData.ErrorCode})`);
        } else {
          // Fallback for unexpected JSON format
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
      } else {
        // Text response - check for success/error indicators
        const responseLower = responseText.toLowerCase();
        if (responseLower.includes('error') || responseLower.includes('failed') || responseLower.includes('invalid')) {
          throw new Error(`SMSIndia Hub API error: ${responseText}`);
        } else if (responseLower.includes('success') || responseLower.includes('sent') || responseLower.includes('done') || responseLower.includes('accepted')) {
          // Success indicators found in text
          return {
            success: true,
            messageId: `sms_${Date.now()}`,
            status: 'sent',
            to: normalizedPhone,
            body: message,
            provider: 'SMSIndia Hub',
            response: responseText
          };
        } else {
          // Unknown format, assume success (SMSIndiaHub sometimes returns empty or unexpected formats)
          console.warn('SMSIndia Hub returned unexpected response format, assuming success');
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
      }

    } catch (error) {
      // Re-throw if already formatted
      if (error.message && error.message.includes('SMSIndia Hub')) {
        throw error;
      }
      
      // Handle fetch-specific errors
      if (error.name === 'AbortError') {
        throw new Error('SMSIndia Hub request timeout. Please try again.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to SMSIndia Hub service. Please check your internet connection.');
      } else if (error.code === 'ECONNRESET') {
        throw new Error('SMSIndia Hub connection was reset. Please try again.');
      }
      
      // Handle other errors
      console.error('SMSIndia Hub sendOTP error:', error);
      throw new Error(`SMSIndia Hub error: ${error.message}`);
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
      // Initialize credentials (lazy loading)
      this._initialize();
      
      // Load credentials
      const apiKey = this._apiKey || process.env.SMSINDIAHUB_API_KEY;
      const senderId = this._senderId || process.env.SMSINDIAHUB_SENDER_ID;
      
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

      // Make GET request to SMSIndia Hub API using native fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'DatingApp/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('SMSIndia Hub request timeout. Please try again.');
        }
        throw new Error('Unable to connect to SMSIndia Hub service. Please check your internet connection.');
      }
      
      if (!response.ok) {
        throw new Error(`SMSIndia Hub API error (${response.status})`);
      }
      
      const responseText = await response.text();
      
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
      if (error.message && error.message.includes('SMSIndia Hub')) {
        throw error;
      }
      throw new Error(`SMSIndia Hub error: ${error.message}`);
    }
  }

  /**
   * Get account balance from SMSIndia Hub
   * @returns {Promise<Object>} - Balance information
   */
  async getBalance() {
    try {
      // Initialize credentials (lazy loading)
      this._initialize();
      
      // Load credentials
      const apiKey = this._apiKey || process.env.SMSINDIAHUB_API_KEY;
      
      if (!apiKey) {
        throw new Error('SMSIndia Hub not configured.');
      }

      // SMSIndia Hub balance API endpoint
      const balanceUrl = `http://cloud.smsindiahub.in/vendorsms/checkbalance.aspx?APIKey=${apiKey}`;
      
      // Make GET request using native fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      let response;
      try {
        response = await fetch(balanceUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'DatingApp/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('SMSIndia Hub request timeout.');
        }
        throw new Error('Unable to connect to SMSIndia Hub service.');
      }
      
      if (!response.ok) {
        throw new Error(`SMSIndia Hub API error (${response.status})`);
      }
      
      const responseText = await response.text();

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

