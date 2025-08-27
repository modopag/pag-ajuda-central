import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Shield, 
  Mail,
  Server,
  Clock
} from 'lucide-react';

interface AuditItem {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'unknown';
  details?: string;
  action?: string;
  links?: { text: string; url: string }[];
}

export default function EmailDeliverabilityAudit() {
  const [auditResults, setAuditResults] = useState<AuditItem[]>([
    {
      id: 'domain-verification',
      title: '1. Domain Verification in AWS SES',
      description: 'Confirm the FROM domain is verified in SES and matches Supabase sender email',
      status: 'unknown',
      action: 'Check AWS SES Console > Verified Identities',
      links: [
        { text: 'AWS SES Console', url: 'https://console.aws.amazon.com/ses/' },
        { text: 'Supabase Auth Settings', url: 'https://supabase.com/dashboard/project/sqroxesqxyzyxzywkybc/auth/providers' }
      ]
    },
    {
      id: 'spf-record',
      title: '2. SPF Record Configuration',
      description: 'Ensure SPF record includes SES authorization',
      status: 'unknown',
      details: 'Required: "v=spf1 include:amazonses.com ~all"',
      action: 'Check DNS records for modopag.com.br',
      links: [
        { text: 'Check SPF Record', url: 'https://mxtoolbox.com/spf.aspx?domain=modopag.com.br' },
        { text: 'SPF Record Generator', url: 'https://www.spfwizard.net/' }
      ]
    },
    {
      id: 'dkim-setup',
      title: '3. DKIM Authentication',
      description: 'Ensure DKIM is active with proper CNAME records from SES',
      status: 'unknown',
      action: 'Verify DKIM CNAMEs are published in DNS',
      links: [
        { text: 'Check DKIM Records', url: 'https://mxtoolbox.com/dkim.aspx?domain=modopag.com.br' },
        { text: 'AWS DKIM Setup Guide', url: 'https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dkim.html' }
      ]
    },
    {
      id: 'dmarc-policy',
      title: '4. DMARC Policy',
      description: 'Add DMARC record for email authentication reporting',
      status: 'unknown',
      details: 'Suggested: "v=DMARC1; p=quarantine; rua=mailto:postmaster@modopag.com.br"',
      action: 'Check for _dmarc.modopag.com.br TXT record',
      links: [
        { text: 'Check DMARC Record', url: 'https://mxtoolbox.com/dmarc.aspx?domain=modopag.com.br' },
        { text: 'DMARC Generator', url: 'https://www.easydmarc.com/tools/dmarc-record-generator' }
      ]
    },
    {
      id: 'ses-region',
      title: '5. SES Region Configuration',
      description: 'Confirm SES region host matches Supabase SMTP configuration',
      status: 'unknown',
      details: 'Common regions: us-east-1, eu-west-1, ap-southeast-1',
      action: 'Verify SMTP hostname in Supabase matches SES region',
      links: [
        { text: 'SES Regions List', url: 'https://docs.aws.amazon.com/ses/latest/dg/regions.html' }
      ]
    },
    {
      id: 'ses-sandbox',
      title: '6. SES Production Mode',
      description: 'Ensure SES account is out of sandbox for arbitrary recipients',
      status: 'unknown',
      action: 'Check SES account status and request production access if needed',
      links: [
        { text: 'Request Production Access', url: 'https://console.aws.amazon.com/support/contacts#/rdqtype=service-limit-increase&type=service-limit-increase' }
      ]
    },
    {
      id: 'rate-limits',
      title: '7. Rate Limits Configuration',
      description: 'Document and configure appropriate rate limits',
      status: 'unknown',
      details: 'SES default: 14 emails/second, 200 emails/day (sandbox)',
      action: 'Configure Supabase Auth rate limits to match SES capacity',
      links: [
        { text: 'SES Sending Quotas', url: 'https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html' }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge variant="secondary">PENDING</Badge>;
    }
  };

  const updateAuditItem = (id: string, updates: Partial<AuditItem>) => {
    setAuditResults(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const getOverallStatus = () => {
    const statuses = auditResults.map(item => item.status);
    const hasFailures = statuses.includes('fail');
    const hasWarnings = statuses.includes('warning');
    const hasUnknown = statuses.includes('unknown');

    if (hasFailures) return { status: 'fail', text: 'Issues Found', color: 'text-red-600' };
    if (hasWarnings) return { status: 'warning', text: 'Warnings', color: 'text-yellow-600' };
    if (hasUnknown) return { status: 'unknown', text: 'Audit Required', color: 'text-gray-600' };
    return { status: 'pass', text: 'All Good', color: 'text-green-600' };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Email Deliverability Audit
          <Badge variant="outline">AWS SES + Supabase</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <span className={`font-medium ${overallStatus.color}`}>{overallStatus.text}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            This audit checks email authentication and deliverability configuration for modopag.com.br.
            Complete each item to ensure reliable email delivery.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {auditResults.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-muted">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <h3 className="font-medium">{item.title}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    
                    {item.details && (
                      <div className="text-sm bg-muted/50 p-2 rounded">
                        <strong>Details:</strong> {item.details}
                      </div>
                    )}
                    
                    {item.action && (
                      <div className="text-sm text-blue-600">
                        <strong>Action:</strong> {item.action}
                      </div>
                    )}
                    
                    {item.links && item.links.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.links.map((link, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-7 text-xs"
                          >
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.text}
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAuditItem(item.id, { status: 'pass' })}
                      className="h-7 px-2"
                    >
                      ✓
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAuditItem(item.id, { status: 'fail' })}
                      className="h-7 px-2"
                    >
                      ✗
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAuditItem(item.id, { status: 'warning' })}
                      className="h-7 px-2"
                    >
                      ⚠
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert>
          <Server className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick DNS Check Commands:</strong><br />
            • SPF: <code>dig modopag.com.br TXT | grep spf</code><br />
            • DMARC: <code>dig _dmarc.modopag.com.br TXT</code><br />
            • DKIM: <code>dig selector1._domainkey.modopag.com.br CNAME</code>
          </AlertDescription>
        </Alert>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Common SES Rate Limits:</strong><br />
            • Sandbox: 200 emails/day, 1 email/second<br />
            • Production: Starts at 200/day, 14/second (can be increased)<br />
            • Configure Supabase Auth limits accordingly
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}