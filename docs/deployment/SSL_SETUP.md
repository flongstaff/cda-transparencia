# 🔒 SSL Certificate Setup for cda-transparencia.org

## Overview

This guide covers SSL certificate configuration for the Carmen de Areco Transparency Portal using Cloudflare's free SSL certificates.

## 🚀 Quick Setup

### Step 1: Cloudflare SSL Configuration

1. **Access SSL Settings**
   - Log in to your Cloudflare dashboard
   - Select your `cda-transparencia.org` domain
   - Navigate to `SSL/TLS` → `Overview`

2. **Set Encryption Mode**
   ```
   Recommended: Full (strict)
   
   Options:
   - Off: No encryption (NOT recommended)
   - Flexible: Cloudflare to visitor only
   - Full: End-to-end, allows self-signed certificates
   - Full (strict): End-to-end with valid certificates ✅
   ```

3. **Enable Always Use HTTPS**
   - Go to `SSL/TLS` → `Edge Certificates`
   - Toggle `Always Use HTTPS` to ON
   - This redirects all HTTP traffic to HTTPS automatically

### Step 2: Advanced SSL Settings

1. **Minimum TLS Version**
   ```
   Recommended: TLS 1.2
   Available: TLS 1.0, 1.1, 1.2, 1.3
   ```

2. **Opportunistic Encryption**
   - Enable for better security
   - Encrypts HTTP/2 connections when possible

3. **TLS 1.3**
   - Enable for latest security standards
   - Better performance and security

### Step 3: Certificate Authority Authorization (CAA)

Add CAA records to specify which Certificate Authorities can issue certificates:

```dns
Type: CAA
Name: @
Value: 0 issue "digicert.com"
TTL: Auto

Type: CAA  
Name: @
Value: 0 issue "letsencrypt.org"
TTL: Auto

Type: CAA
Name: @
Value: 0 iodef "mailto:admin@cda-transparencia.org"
TTL: Auto
```

## 🔧 Worker Configuration

### Security Headers in Worker

The Cloudflare Worker includes comprehensive security headers:

```javascript
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https://api.cda-transparencia.org",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ')
};
```

### HTTP Strict Transport Security (HSTS)

HSTS is automatically configured to:
- Force HTTPS for 1 year (`max-age=31536000`)
- Include all subdomains (`includeSubDomains`)
- Allow preloading in browsers (`preload`)

## 📋 Verification Checklist

### SSL Certificate Validation

```bash
# Test SSL certificate installation
openssl s_client -connect cda-transparencia.org:443 -servername cda-transparencia.org

# Check certificate expiration
echo | openssl s_client -connect cda-transparencia.org:443 2>/dev/null | openssl x509 -noout -dates

# Verify certificate chain
curl -I https://cda-transparencia.org

# Test HTTP to HTTPS redirect
curl -I http://cda-transparencia.org
```

### Security Headers Test

```bash
# Test security headers
curl -I https://cda-transparencia.org

# Expected headers:
# strict-transport-security: max-age=31536000; includeSubDomains; preload
# x-content-type-options: nosniff  
# x-frame-options: DENY
# content-security-policy: [policy string]
```

### Online SSL Testing

1. **SSL Server Test**
   - Visit: https://www.ssllabs.com/ssltest/
   - Enter: `cda-transparencia.org`
   - Target Grade: A or A+

2. **Security Headers Test**
   - Visit: https://securityheaders.com/
   - Enter: `https://cda-transparencia.org`
   - Target Grade: A or A+

## 🔄 Certificate Renewal

### Automatic Renewal

Cloudflare automatically handles:
- ✅ Certificate renewal (90 days before expiration)
- ✅ Certificate provisioning for new domains
- ✅ Multi-domain certificates (SAN)
- ✅ Wildcard certificates (Business plan and above)

### Manual Certificate Management

For advanced users, you can:

1. **Upload Custom Certificates**
   - Go to `SSL/TLS` → `Custom Certificates`
   - Upload your certificate and private key
   - Configure certificate settings

2. **Origin Certificates**
   - Generate certificates for your origin server
   - Install between Cloudflare and your server
   - Supports up to 15-year validity

## 🚨 Troubleshooting

### Common SSL Issues

**Mixed Content Warnings**
```bash
# Problem: HTTP resources on HTTPS page
# Solution: Update all links to use HTTPS or relative URLs
# Check: Browser developer tools console
```

**Certificate Mismatch**
```bash  
# Problem: Certificate doesn't match domain
# Solution: Verify domain in Cloudflare matches your domain
# Check: Certificate subject alternative names (SAN)
```

**SSL Handshake Failures**
```bash
# Problem: SSL negotiation fails
# Solution: Check TLS version compatibility
# Check: Minimum TLS version settings in Cloudflare
```

**Redirect Loops**
```bash
# Problem: Infinite redirects between HTTP/HTTPS
# Solution: Set correct encryption mode in Cloudflare
# Check: Origin server HTTPS configuration
```

### SSL Debugging Commands

```bash
# Check SSL certificate details
openssl x509 -in certificate.crt -text -noout

# Test specific SSL protocols
openssl s_client -connect cda-transparencia.org:443 -tls1_2

# Verify certificate chain
curl --verbose https://cda-transparencia.org 2>&1 | grep -E "(SSL|TLS)"

# Check for mixed content
grep -r "http://" frontend/src/ --include="*.tsx" --include="*.ts"
```

## 🎯 Best Practices

### Security
- ✅ Use "Full (strict)" encryption mode
- ✅ Enable "Always Use HTTPS"
- ✅ Set minimum TLS version to 1.2
- ✅ Configure proper security headers
- ✅ Regular security audits

### Performance  
- ✅ Enable HTTP/2 and HTTP/3
- ✅ Use TLS 1.3 for better performance
- ✅ Configure appropriate cache headers
- ✅ Enable Brotli compression

### Monitoring
- ✅ Set up certificate expiration alerts
- ✅ Monitor SSL Labs ratings
- ✅ Check security headers regularly
- ✅ Audit mixed content warnings

## 📊 Monitoring & Alerts

### Cloudflare Notifications

Set up alerts for:
- Certificate expiration (30 days before)
- SSL/TLS errors
- Security events
- Performance degradation

### External Monitoring

Consider using:
- **SSL Monitor**: Certificate expiration tracking
- **Security Headers**: Regular header compliance checks  
- **Web Vitals**: Performance monitoring with security metrics
- **Uptime Monitors**: HTTPS availability checks

---

## ✅ SSL Setup Checklist

- [ ] Domain added to Cloudflare
- [ ] SSL encryption mode set to "Full (strict)"
- [ ] "Always Use HTTPS" enabled
- [ ] Minimum TLS version set to 1.2 or higher
- [ ] Security headers configured in Worker
- [ ] CAA records configured (optional)
- [ ] SSL certificate validated (SSL Labs A+ grade)
- [ ] HTTP to HTTPS redirects working
- [ ] Mixed content warnings resolved
- [ ] Certificate expiration monitoring set up

**🔒 Your Carmen de Areco Transparency Portal is now secured with enterprise-grade SSL!**