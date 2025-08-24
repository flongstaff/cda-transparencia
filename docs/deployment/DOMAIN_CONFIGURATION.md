# 🌐 Domain Configuration Guide - cda-transparencia.org

## Overview

Complete guide for configuring the `cda-transparencia.org` domain with Cloudflare for the Carmen de Areco Transparency Portal.

## 🚀 Prerequisites

- Domain registration for `cda-transparencia.org`
- Active Cloudflare account (free tier sufficient)
- Access to domain registrar's DNS settings

## 📋 Step-by-Step Configuration

### Step 1: Add Domain to Cloudflare

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click "Add a Site"

2. **Enter Domain**
   ```
   Domain: cda-transparencia.org
   Plan: Free (sufficient for this project)
   ```

3. **Import DNS Records**
   - Cloudflare will scan existing DNS records
   - Review and import relevant records
   - Delete any conflicting records

### Step 2: Update Nameservers

Cloudflare will provide two nameservers, for example:
```
Primary: elena.ns.cloudflare.com
Secondary: tim.ns.cloudflare.com
```

**Update at Your Domain Registrar:**
1. Login to your domain registrar
2. Navigate to DNS/Nameserver settings
3. Replace existing nameservers with Cloudflare's
4. Save changes

**Verification:**
```bash
# Check nameserver propagation
dig NS cda-transparencia.org

# Expected output should show Cloudflare nameservers
# elena.ns.cloudflare.com
# tim.ns.cloudflare.com
```

### Step 3: Configure DNS Records

Create the following DNS records in Cloudflare:

#### Primary Records
```dns
Type: A
Name: @ (root)
Content: 192.0.2.1  # Placeholder - will be overridden by Worker route
Proxied: Yes (orange cloud)
TTL: Auto

Type: CNAME
Name: www
Content: cda-transparencia.org
Proxied: Yes (orange cloud)
TTL: Auto
```

#### Worker Routes (Configured in wrangler.toml)
The actual traffic routing is handled by Cloudflare Workers:
```toml
[env.production]
name = "carmen-de-areco-transparency-prod"
routes = [
  { pattern = "cda-transparencia.org/*", zone_name = "cda-transparencia.org" },
  { pattern = "www.cda-transparencia.org/*", zone_name = "cda-transparencia.org" }
]
```

#### Optional Records
```dns
# Mail exchange (if needed)
Type: MX
Name: @
Content: mail.cda-transparencia.org
Priority: 10
TTL: Auto

# SPF record for email security
Type: TXT
Name: @
Content: "v=spf1 include:_spf.google.com ~all"
TTL: Auto

# DMARC policy
Type: TXT
Name: _dmarc
Content: "v=DMARC1; p=quarantine; rua=mailto:admin@cda-transparencia.org"
TTL: Auto
```

### Step 4: SSL/TLS Configuration

1. **SSL Mode**
   - Go to `SSL/TLS` → `Overview`
   - Set to `Full (strict)` for maximum security

2. **Force HTTPS**
   - Go to `SSL/TLS` → `Edge Certificates`
   - Enable `Always Use HTTPS`

3. **HSTS**
   - Enable `HTTP Strict Transport Security`
   - Max Age: 6 months (15552000 seconds)
   - Include subdomains: Yes
   - Preload: Yes

### Step 5: Security Configuration

#### Firewall Rules
```javascript
// Example firewall rule for geographic restrictions (optional)
(ip.geoip.country ne "AR" and ip.geoip.country ne "US" and ip.geoip.country ne "ES")
// Action: Challenge or Block
```

#### Security Level
```
Setting: Medium or High
Location: Security → Settings → Security Level
```

#### Bot Fight Mode
```
Enable: Yes (free tier)
Location: Security → Bots
```

### Step 6: Performance Optimization

#### Caching Rules
```javascript
// Static assets
File extension matches "css" or "js" or "png" or "jpg" or "jpeg" or "gif" or "svg" or "ico" or "woff" or "woff2"
// Cache Level: Cache Everything
// Edge TTL: 1 month
// Browser TTL: 4 hours
```

#### Compression
```
Setting: Gzip + Brotli
Location: Speed → Optimization
```

#### Minification
```
HTML: Auto Minify
CSS: Auto Minify  
JavaScript: Auto Minify
Location: Speed → Optimization
```

## 🔧 Environment-Specific Configuration

### Production Environment
```toml
[env.production]
name = "carmen-de-areco-transparency-prod"
routes = [
  { pattern = "cda-transparencia.org/*", zone_name = "cda-transparencia.org" }
]
vars = { 
  ENVIRONMENT = "production",
  SITE_URL = "https://cda-transparencia.org"
}
```

### Staging Environment  
```toml
[env.staging]
name = "carmen-de-areco-transparency-staging"
routes = [
  { pattern = "staging.cda-transparencia.org/*", zone_name = "cda-transparencia.org" }
]
vars = { 
  ENVIRONMENT = "staging",
  SITE_URL = "https://staging.cda-transparencia.org"
}
```

### Development Environment
```toml
[env.development]
name = "carmen-de-areco-transparency-dev"
# Uses workers.dev subdomain for development
vars = { 
  ENVIRONMENT = "development"
}
```

## 📊 Monitoring & Verification

### DNS Propagation Check
```bash
# Global DNS propagation
dig @8.8.8.8 cda-transparencia.org
dig @1.1.1.1 cda-transparencia.org
dig @208.67.222.222 cda-transparencia.org

# MX record check  
dig MX cda-transparencia.org

# TXT record verification
dig TXT cda-transparencia.org
```

### SSL Certificate Validation
```bash
# Certificate details
openssl s_client -connect cda-transparencia.org:443 -servername cda-transparencia.org

# Certificate expiration
echo | openssl s_client -connect cda-transparencia.org:443 2>/dev/null | openssl x509 -noout -enddate

# SSL Labs test
curl "https://api.ssllabs.com/api/v3/analyze?host=cda-transparencia.org"
```

### Performance Testing
```bash
# Load time test
curl -w "@curl-format.txt" -o /dev/null -s https://cda-transparencia.org

# Create curl-format.txt:
     time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
```

## 🚨 Troubleshooting

### Common Issues

**Domain Not Resolving**
```bash
# Check nameserver propagation
dig NS cda-transparencia.org +trace

# Verify A record
dig A cda-transparencia.org
```

**SSL Certificate Issues**
```bash  
# Check SSL chain
curl -vI https://cda-transparencia.org

# Test specific TLS versions
openssl s_client -connect cda-transparencia.org:443 -tls1_2
```

**Cloudflare Worker Not Responding**
```bash
# Check worker deployment status
wrangler whoami
wrangler deployments list

# Test worker directly
curl -H "cf-worker: test" https://cda-transparencia.org
```

### DNS Debugging Commands
```bash
# Comprehensive DNS lookup
nslookup -type=ANY cda-transparencia.org

# Reverse DNS lookup
dig -x [IP_ADDRESS]

# Check specific DNS servers
dig @ns1.cloudflare.com cda-transparencia.org
dig @ns2.cloudflare.com cda-transparencia.org
```

## 📈 Analytics & Monitoring

### Cloudflare Analytics
- Go to `Analytics & Logs` → `Web Analytics`
- Track visitor metrics, performance, and security events
- Set up custom events for transparency portal interactions

### External Monitoring Services
```yaml
# Example Uptime Kuma configuration
monitors:
  - name: "CDA Transparencia Portal"
    type: "http"
    url: "https://cda-transparencia.org"
    interval: 300  # 5 minutes
    expected_status: 200
    
  - name: "CDA Transparencia SSL"
    type: "tls"
    hostname: "cda-transparencia.org"
    port: 443
    days_remaining: 30  # Alert when <30 days
```

## 🎯 Best Practices

### DNS Configuration
- ✅ Use short TTL values during initial setup (300 seconds)
- ✅ Increase TTL after configuration is stable (3600+ seconds)
- ✅ Enable DNSSEC for additional security
- ✅ Regular DNS record audits

### Security
- ✅ Enable CAA records to control certificate issuance
- ✅ Configure SPF, DKIM, and DMARC for email security
- ✅ Use security headers in Cloudflare Worker
- ✅ Regular security assessments

### Performance  
- ✅ Optimize cache settings for different content types
- ✅ Enable HTTP/2 and HTTP/3
- ✅ Use appropriate compression settings
- ✅ Monitor Core Web Vitals

## ✅ Domain Configuration Checklist

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] DNS propagation confirmed
- [ ] A/CNAME records configured  
- [ ] Worker routes configured in wrangler.toml
- [ ] SSL certificate active and valid
- [ ] HTTPS redirects working
- [ ] Security headers configured
- [ ] Performance optimization enabled
- [ ] Monitoring and alerts configured
- [ ] Backup DNS records documented

**🌐 Your cda-transparencia.org domain is now fully configured and optimized!**

For advanced configuration and troubleshooting, consult the [Cloudflare Documentation](https://developers.cloudflare.com/) or contact support.