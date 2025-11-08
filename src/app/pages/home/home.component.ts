import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoreAuthService } from '../../core/auth.service';

interface Highlight {
  label: string;
  value: string;
  detail: string;
}

interface Capability {
  title: string;
  description: string;
  link?: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface WorkflowStep {
  title: string;
  description: string;
}

interface Audience {
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomePageComponent {
  private api = inject(CoreAuthService);
  readonly isAuthed = signal<boolean>(false);
  constructor() { this.bootstrapAuthState(); }

  private async bootstrapAuthState() {
    try {
      const res = await this.api.ensureAuth();
      this.isAuthed.set(!!res?.data?.valid);
    } catch { this.isAuthed.set(false); }
  }

  loginUrl(): string {
    if (typeof window === 'undefined') return 'https://berjis.tech/auth/login';
    const host = window.location.hostname;
    const m = host.match(/(^|\.)berjis\.(test|tech|com)$/i);
    const root = m ? `berjis.${m[2].toLowerCase()}` : 'berjis.tech';
    const origin = window.location.origin;
    const target = `${window.location.protocol}//${root}/auth/login?returnUrl=${encodeURIComponent(origin + '/dashboard')}`;
    return target;
  }
  readonly heroHighlights: Highlight[] = [
    { label: 'Storage Nodes', value: '7,200+', detail: 'Active micro-warehousing locations across the network.' },
    { label: 'Drivers & Fleets', value: '18,500+', detail: 'Independent and enterprise drivers ready to move cargo.' },
    { label: 'Fulfilment Speed', value: '2.5x faster', detail: 'Average reduction in last-mile lead times with distributed routing.' }
  ];

  readonly capabilities: Capability[] = [
    {
      title: 'Distributed Storage Mesh',
      description: 'Spin up capacity on-demand with verified spaces near ports, airports, and customers.',
      link: '/storage'
    },
    {
      title: 'AI-Powered Fleet Orchestration',
      description: 'Blend owned vehicles with on-demand drivers and automate assignments in real-time.',
      link: '/transport'
    },
    {
      title: 'Commerce-Ready Marketplace',
      description: 'List raw materials, wholesale stock, or finished goods and connect to fulfilment instantly.',
      link: '/products'
    },
    {
      title: 'Unified Control Tower',
      description: 'Monitor storage, transport, orders, CRM, and analytics from one intuitive workspace.',
      link: '/dashboard'
    }
  ];

  readonly features: Feature[] = [
    {
      icon: '🌐',
      title: 'Dynamic Capacity',
      description: 'Auto-balance inventory and shipment loads based on live demand, geography, and SLA targets.'
    },
    {
      icon: '🛰️',
      title: 'Live Telemetry',
      description: 'Realtime GPS tracking for vehicles and assets with automated arrival & departure detection.'
    },
    {
      icon: '🤝',
      title: 'Collaboration Layers',
      description: 'Invite staff, partners, and clients with role-based controls, approvals, and audit trails.'
    },
    {
      icon: '📦',
      title: 'Smart Fulfilment',
      description: 'Convert orders to shipments with optimized multi-leg routes and automated proof of delivery.'
    },
    {
      icon: '📊',
      title: 'Decision Intelligence',
      description: 'KPI dashboards highlight utilisation, dwell times, win rates, and SLA health across your network.'
    },
    {
      icon: '💳',
      title: 'Embedded Finance',
      description: 'Invoice, reconcile, and analyze revenue vs. spend without leaving your logistics command center.'
    }
  ];

  readonly workflow: WorkflowStep[] = [
    {
      title: 'Connect supply nodes',
      description: 'Register spaces, fleets, and catalogues in minutes. Sync legacy systems via APIs or CSV imports.'
    },
    {
      title: 'Activate marketplace',
      description: 'Publish offers, broadcast capacity, and let partners discover you through curated exchanges.'
    },
    {
      title: 'Automate execution',
      description: 'Dispatch jobs, orchestrate fulfilment, and keep customers aligned through live tracking links.'
    },
    {
      title: 'Measure & optimise',
      description: 'Drill into performance, forecast demand, and launch new corridors with confidence.'
    }
  ];

  readonly audiences: Audience[] = [
    {
      title: 'Scaling Manufacturers',
      description: 'Bridge production and demand with just-in-time inventory positioning and digital order flows.'
    },
    {
      title: '3PL & Logistics Leaders',
      description: 'Expand reach without heavy CapEx. Plug into distributed facilities and elastic workforces.'
    },
    {
      title: 'Retail & E-commerce Teams',
      description: 'Stage inventory closer to shoppers, unlock same-day delivery, and control last-mile experience.'
    },
    {
      title: 'Independent Operators',
      description: 'Monetise unused space or vehicles, access quality jobs, and grow recurring revenue on your terms.'
    }
  ];
}
