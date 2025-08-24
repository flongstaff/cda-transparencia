#!/usr/bin/env python3
"""
OSINT Compliance Monitor
Real-time monitoring to ensure all OSINT activities remain legal
Compatible with both Argentine and Australian law
"""

import os
import json
import time
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple
from urllib.parse import urlparse
import hashlib
from dataclasses import dataclass
from enum import Enum
import threading
import queue

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ComplianceStatus(Enum):
    """Compliance status levels"""
    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    BLOCKED = "blocked"

@dataclass
class ComplianceRule:
    """Defines a compliance rule"""
    name: str
    description: str
    check_function: callable
    severity: str  # 'critical', 'high', 'medium', 'low'
    legal_reference: Dict[str, str]  # {'AR': 'Ley X', 'AU': 'Act Y'}

class OSINTComplianceMonitor:
    """
    Monitors OSINT activities in real-time to ensure legal compliance
    """
    
    def __init__(self):
        self.rules = self._initialize_rules()
        self.activity_log = []
        self.violations = []
        self.warnings = []
        self.blocked_activities = []
        
        # Rate limiting tracking
        self.domain_access_times: Dict[str, List[datetime]] = {}
        self.api_calls: Dict[str, List[datetime]] = {}
        
        # Personal data patterns (to detect and prevent collection)
        self.pii_patterns = {
            'dni_ar': r'\b\d{7,8}\b',  # Argentine DNI
            'cuit_ar': r'\b\d{2}-\d{8}-\d{1}\b',  # Argentine CUIT
            'phone_ar': r'\+?54?\s?9?\s?\d{2,4}\s?\d{6,8}',  # Argentine phone
            'tfn_au': r'\b\d{3}\s?\d{3}\s?\d{3}\b',  # Australian TFN
            'medicare_au': r'\b\d{10}\b',  # Australian Medicare
            'phone_au': r'\+?61?\s?4\d{2}\s?\d{3}\s?\d{3}',  # Australian mobile
            'email_personal': r'\b[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.[a-zA-Z]{2,}\b',
            'credit_card': r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
        }
        
        # Government domains (allowed for transparency)
        self.gov_domains = {
            'ar': ['.gob.ar', '.gov.ar', '.jus.gob.ar', '.gba.gob.ar'],
            'au': ['.gov.au', '.nsw.gov.au', '.vic.gov.au', '.qld.gov.au']
        }
        
        # Start monitoring thread
        self.monitoring = True
        self.monitor_thread = threading.Thread(target=self._continuous_monitoring)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
    def _initialize_rules(self) -> List[ComplianceRule]:
        """Initialize compliance rules"""
        rules = [
            ComplianceRule(
                name="rate_limiting",
                description="Ensure requests respect rate limits",
                check_function=self._check_rate_limit,
                severity="high",
                legal_reference={
                    'AR': 'Código Penal Art. 153',
                    'AU': 'Crimes Act 1914 s.477.1'
                }
            ),
            ComplianceRule(
                name="robots_txt",
                description="Respect robots.txt directives",
                check_function=self._check_robots_compliance,
                severity="high",
                legal_reference={
                    'AR': 'Best practices',
                    'AU': 'Industry standards'
                }
            ),
            ComplianceRule(
                name="no_pii",
                description="Prevent personal data collection",
                check_function=self._check_no_pii,
                severity="critical",
                legal_reference={
                    'AR': 'Ley 25.326 Art. 5',
                    'AU': 'Privacy Act 1988 APP 3'
                }
            ),
            ComplianceRule(
                name="public_only",
                description="Only access public resources",
                check_function=self._check_public_access,
                severity="critical",
                legal_reference={
                    'AR': 'Código Penal Art. 153',
                    'AU': 'Crimes Act 1914 s.478.1'
                }
            ),
            ComplianceRule(
                name="gov_transparency",
                description="Verify government transparency purpose",
                check_function=self._check_transparency_purpose,
                severity="medium",
                legal_reference={
                    'AR': 'Ley 27.275',
                    'AU': 'FOI Act 1982'
                }
            ),
            ComplianceRule(
                name="no_exploits",
                description="Prevent use of exploits or vulnerabilities",
                check_function=self._check_no_exploits,
                severity="critical",
                legal_reference={
                    'AR': 'Código Penal Art. 255',
                    'AU': 'Crimes Act 1914 Part 10.7'
                }
            )
        ]
        
        return rules
        
    def check_activity(self, activity: Dict) -> Tuple[ComplianceStatus, List[str]]:
        """
        Check if an OSINT activity is compliant
        
        Args:
            activity: Dictionary containing activity details
            
        Returns:
            Tuple of (ComplianceStatus, List of issues)
        """
        issues = []
        highest_severity = ComplianceStatus.COMPLIANT
        
        # Log the activity
        activity['timestamp'] = datetime.now().isoformat()
        activity['id'] = hashlib.md5(
            json.dumps(activity, sort_keys=True).encode()
        ).hexdigest()[:8]
        
        self.activity_log.append(activity)
        
        # Check against all rules
        for rule in self.rules:
            try:
                is_compliant, issue = rule.check_function(activity)
                
                if not is_compliant:
                    issues.append(f"{rule.name}: {issue}")
                    
                    if rule.severity == "critical":
                        highest_severity = ComplianceStatus.VIOLATION
                        self.violations.append({
                            'activity': activity,
                            'rule': rule.name,
                            'issue': issue,
                            'timestamp': datetime.now().isoformat()
                        })
                    elif rule.severity == "high" and highest_severity != ComplianceStatus.VIOLATION:
                        highest_severity = ComplianceStatus.WARNING
                        self.warnings.append({
                            'activity': activity,
                            'rule': rule.name,
                            'issue': issue,
                            'timestamp': datetime.now().isoformat()
                        })
                        
            except Exception as e:
                logger.error(f"Error checking rule {rule.name}: {str(e)}")
                issues.append(f"Error checking {rule.name}")
                
        # Block critical violations
        if highest_severity == ComplianceStatus.VIOLATION:
            self.blocked_activities.append(activity)
            highest_severity = ComplianceStatus.BLOCKED
            logger.warning(f"BLOCKED ACTIVITY: {activity.get('type', 'unknown')}")
            
        return highest_severity, issues
        
    def _check_rate_limit(self, activity: Dict) -> Tuple[bool, Optional[str]]:
        """Check if activity respects rate limits"""
        if activity.get('type') != 'web_request':
            return True, None
            
        url = activity.get('url', '')
        domain = urlparse(url).netloc
        
        if not domain:
            return True, None
            
        # Check domain access times
        now = datetime.now()
        if domain not in self.domain_access_times:
            self.domain_access_times[domain] = []
            
        # Remove old entries (older than 1 minute)
        self.domain_access_times[domain] = [
            t for t in self.domain_access_times[domain]
            if now - t < timedelta(minutes=1)
        ]
        
        # Check rate (max 30 requests per minute = 1 every 2 seconds)
        if len(self.domain_access_times[domain]) >= 30:
            return False, f"Rate limit exceeded for {domain} (max 30/min)"
            
        # Check minimum delay (2 seconds)
        if self.domain_access_times[domain]:
            last_access = self.domain_access_times[domain][-1]
            if now - last_access < timedelta(seconds=2):
                return False, f"Insufficient delay for {domain} (min 2 seconds)"
                
        # Record this access
        self.domain_access_times[domain].append(now)
        
        return True, None
        
    def _check_robots_compliance(self, activity: Dict) -> Tuple[bool, Optional[str]]:
        """Check robots.txt compliance"""
        if activity.get('type') != 'web_request':
            return True, None
            
        # Check if robots.txt was consulted
        if not activity.get('robots_checked', False):
            return False, "robots.txt not checked before access"
            
        # Check if access was allowed
        if not activity.get('robots_allowed', True):
            return False, "Access disallowed by robots.txt"
            
        return True, None
        
    def _check_no_pii(self, activity: Dict) -> Tuple[bool, Optional[str]]:
        """Check for personal information collection"""
        data = activity.get('data', '')
        
        if not isinstance(data, str):
            data = json.dumps(data)
            
        # Check for PII patterns
        for pii_type, pattern in self.pii_patterns.items():
            if re.search(pattern, data, re.IGNORECASE):
                # Exception for public officials in government context
                if pii_type == 'email_personal' and self._is_government_context(activity):
                    continue
                    
                return False, f"Potential PII detected: {pii_type}"
                
        return True, None
        
    def _check_public_access(self, activity: Dict) -> Tuple[bool, Optional[str]]:
        """Ensure only public resources are accessed"""
        url = activity.get('url', '')
        
        # Check for authentication attempts
        if activity.get('authentication'):
            return False, "Authentication attempted on resource"
            
        # Check for admin/private paths
        private_paths = [
            '/admin', '/private', '/internal', '/confidential',
            '/wp-admin', '/phpmyadmin', '/.git', '/.env',
            '/backup', '/config', '/api/private'
        ]
        
        for path in private_paths:
            if path in url.lower():
                return False, f"Attempting to access private path: {path}"
                
        # Check headers for authentication
        headers = activity.get('headers', {})
        auth_headers = ['Authorization', 'Cookie', 'X-API-Key', 'X-Auth-Token']
        
        for header in auth_headers:
            if header in headers:
                return False, f"Authentication header used: {header}"
                
        return True, None
        
    def _check_transparency_purpose(self, activity: Dict) -> Tuple[bool, Optional[str]]:
        """Verify activity is for government transparency"""
        url = activity.get('url', '')
        purpose = activity.get('purpose', '')
        
        # Check if targeting government domain
        is_gov = any(
            domain in url 
            for domains in self.gov_domains.values() 
            for domain in domains
        )
        
        # Check purpose statement
        transparency_keywords = [
            'transparency', 'transparencia', 'public interest',
            'interés público', 'government accountability',
            'rendición de cuentas', 'acceso a la información'
        ]
        
        has_valid_purpose = any(
            keyword in purpose.lower() 
            for keyword in transparency_keywords
        )
        
        if not is_gov and not has_valid_purpose:
            return False, "Activity not clearly for government transparency"
            
        return True, None
        
    def _check_no_exploits(self, activity: Dict) -> Tuple[bool, Optional[str]]:
        """Check for exploit attempts"""
        url = activity.get('url', '')
        data = activity.get('data', '')
        
        if not isinstance(data, str):
            data = json.dumps(data)
            
        # Common exploit patterns
        exploit_patterns = [
            r'<script[^>]*>.*?</script>',  # XSS
            r'(\' OR \'|\' OR 1=1|\" OR \")',  # SQL injection
            r'\.\./', # Directory traversal
            r'%00|%0a|%0d',  # Null byte injection
            r'exec\(|system\(|eval\(',  # Command injection
            r'UNION\s+SELECT',  # SQL injection
            r'javascript:',  # XSS
            r'onerror=|onload=',  # XSS
        ]
        
        for pattern in exploit_patterns:
            if re.search(pattern, url + data, re.IGNORECASE):
                return False, f"Potential exploit detected: {pattern}"
                
        return True, None
        
    def _is_government_context(self, activity: Dict) -> bool:
        """Check if activity is in government context"""
        url = activity.get('url', '')
        return any(
            domain in url 
            for domains in self.gov_domains.values() 
            for domain in domains
        )
        
    def _continuous_monitoring(self):
        """Continuous monitoring thread"""
        while self.monitoring:
            try:
                # Clean old entries
                self._cleanup_old_data()
                
                # Check for patterns in recent activities
                self._analyze_patterns()
                
                # Generate alerts if needed
                self._check_alerts()
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in monitoring thread: {str(e)}")
                
    def _cleanup_old_data(self):
        """Clean up old monitoring data"""
        cutoff = datetime.now() - timedelta(hours=24)
        
        # Clean domain access times
        for domain in list(self.domain_access_times.keys()):
            self.domain_access_times[domain] = [
                t for t in self.domain_access_times[domain]
                if t > cutoff
            ]
            if not self.domain_access_times[domain]:
                del self.domain_access_times[domain]
                
    def _analyze_patterns(self):
        """Analyze patterns in activities"""
        if len(self.activity_log) < 10:
            return
            
        # Check for suspicious patterns
        recent_activities = self.activity_log[-100:]
        
        # Pattern: Rapid automated scanning
        domains = {}
        for activity in recent_activities:
            if activity.get('type') == 'web_request':
                domain = urlparse(activity.get('url', '')).netloc
                domains[domain] = domains.get(domain, 0) + 1
                
        for domain, count in domains.items():
            if count > 50:  # More than 50 requests to same domain
                logger.warning(f"High activity on domain {domain}: {count} requests")
                
    def _check_alerts(self):
        """Check if alerts need to be sent"""
        # Alert on critical violations
        recent_violations = [
            v for v in self.violations
            if datetime.fromisoformat(v['timestamp']) > 
            datetime.now() - timedelta(minutes=5)
        ]
        
        if len(recent_violations) > 5:
            logger.critical(f"ALERT: {len(recent_violations)} violations in last 5 minutes")
            
    def get_compliance_report(self) -> Dict:
        """Generate compliance report"""
        return {
            'summary': {
                'total_activities': len(self.activity_log),
                'violations': len(self.violations),
                'warnings': len(self.warnings),
                'blocked': len(self.blocked_activities),
                'compliance_rate': self._calculate_compliance_rate()
            },
            'recent_violations': self.violations[-10:],
            'recent_warnings': self.warnings[-10:],
            'active_monitoring': {
                'domains_tracked': len(self.domain_access_times),
                'rules_active': len(self.rules)
            },
            'legal_framework': {
                'argentina': ['Ley 27.275', 'Ley 25.326', 'Código Penal'],
                'australia': ['FOI Act 1982', 'Privacy Act 1988', 'Crimes Act 1914']
            },
            'generated_at': datetime.now().isoformat()
        }
        
    def _calculate_compliance_rate(self) -> float:
        """Calculate overall compliance rate"""
        if not self.activity_log:
            return 100.0
            
        compliant = len(self.activity_log) - len(self.violations) - len(self.blocked_activities)
        return (compliant / len(self.activity_log)) * 100

# Example usage and integration
def integrate_with_osint_tool(monitor: OSINTComplianceMonitor):
    """Example of integrating compliance monitor with OSINT tools"""
    
    def compliant_web_request(url: str, **kwargs) -> Optional[requests.Response]:
        """Make a web request with compliance checking"""
        
        # Prepare activity record
        activity = {
            'type': 'web_request',
            'url': url,
            'purpose': kwargs.get('purpose', 'Government transparency research'),
            'headers': kwargs.get('headers', {}),
            'robots_checked': kwargs.get('robots_checked', False),
            'robots_allowed': kwargs.get('robots_allowed', True),
            'timestamp': datetime.now().isoformat()
        }
        
        # Check compliance
        status, issues = monitor.check_activity(activity)
        
        if status == ComplianceStatus.BLOCKED:
            logger.error(f"Request blocked due to compliance issues: {issues}")
            return None
        elif status == ComplianceStatus.WARNING:
            logger.warning(f"Compliance warnings: {issues}")
            
        # Make the request if compliant
        try:
            response = requests.get(url, **kwargs)
            
            # Check response for PII
            response_activity = {
                'type': 'response_check',
                'data': response.text[:1000],  # Check first 1000 chars
                'url': url
            }
            
            status, issues = monitor.check_activity(response_activity)
            
            if status == ComplianceStatus.VIOLATION:
                logger.error("Response contains prohibited content")
                return None
                
            return response
            
        except Exception as e:
            logger.error(f"Request failed: {str(e)}")
            return None
            
    return compliant_web_request

def main():
    """Main execution example"""
    # Initialize compliance monitor
    monitor = OSINTComplianceMonitor()
    
    # Get compliant request function
    compliant_request = integrate_with_osint_tool(monitor)
    
    # Example usage
    logger.info("Starting compliant OSINT operations...")
    
    # Make compliant requests
    urls = [
        'https://carmendeareco.gob.ar/',
        'https://datos.gob.ar/dataset?q=carmen+de+areco',
        'https://www.gba.gob.ar/transparencia'
    ]
    
    for url in urls:
        response = compliant_request(
            url,
            purpose="Government transparency - Carmen de Areco project",
            robots_checked=True,
            robots_allowed=True,
            timeout=30
        )
        
        if response:
            logger.info(f"Successfully collected from {url}")
        else:
            logger.error(f"Failed to collect from {url}")
            
    # Generate compliance report
    report = monitor.get_compliance_report()
    
    print("\n=== COMPLIANCE REPORT ===")
    print(f"Total Activities: {report['summary']['total_activities']}")
    print(f"Compliance Rate: {report['summary']['compliance_rate']:.2f}%")
    print(f"Violations: {report['summary']['violations']}")
    print(f"Warnings: {report['summary']['warnings']}")
    print(f"Blocked: {report['summary']['blocked']}")
    
    # Save report
    with open('compliance_report.json', 'w') as f:
        json.dump(report, f, indent=2)
        
    logger.info("Compliance monitoring complete!")

if __name__ == "__main__":
    main()