import React, { useContext, useState } from 'react';
import { AppContext } from './appContext';

const SERVICES = [
  {
    id:          'stripePublishableKey',
    label:       'Stripe',
    description: 'Publishable key for Stripe Elements card tokenisation.',
    placeholder: 'pk_live_… or pk_test_…',
    docsHref:    'https://dashboard.stripe.com/apikeys',
    isSecret:    (v) => v.startsWith('sk_'),
    secretWarn:  'This looks like a Stripe secret key (starts with sk_). Only paste publishable keys (pk_) here — secret keys must never leave your server.',
  },
  {
    id:          'mapboxToken',
    label:       'Mapbox',
    description: 'Access token for address autocomplete and delivery validation.',
    placeholder: 'pk.eyJ1IjoidXNlcm5h…',
    docsHref:    'https://account.mapbox.com/access-tokens/',
    isSecret:    (v) => v.startsWith('sk.'),
    secretWarn:  'This looks like a Mapbox secret token (starts with sk.). Use a public access token instead.',
  },
];

function StatusBadge({ value, isSecret }) {
  if (!value) return <span className="integration-badge integration-badge--off">Not configured</span>;
  if (isSecret(value)) return <span className="integration-badge integration-badge--warn">⚠ Secret key detected</span>;
  return <span className="integration-badge integration-badge--ok">Configured</span>;
}

function ServiceRow({ service, value, onChange }) {
  const [show, setShow] = useState(false);
  const warn = value && service.isSecret(value);

  return (
    <div className={`integration-row${warn ? ' integration-row--warn' : ''}`}>
      <div className="integration-row-header">
        <span className="integration-label">{service.label}</span>
        <StatusBadge value={value} isSecret={service.isSecret} />
      </div>
      <p className="integration-description">{service.description}</p>

      {warn && <p className="integration-secret-warn">{service.secretWarn}</p>}

      <div className="integration-input-wrap">
        <input
          className="integration-input"
          type={show ? 'text' : 'password'}
          placeholder={service.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          className="integration-toggle"
          type="button"
          onClick={() => setShow((s) => !s)}
          title={show ? 'Hide' : 'Show'}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>

      {value && (
        <button
          className="integration-clear"
          type="button"
          onClick={() => onChange('')}
        >
          Clear
        </button>
      )}
    </div>
  );
}

const IntegrationsPanel = () => {
  const { state, setIntegrations } = useContext(AppContext);
  const integrations = state.integrations ?? {};

  const handleChange = (id, value) => {
    setIntegrations((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="integrations-panel">
      <p className="integration-panel-notice">
        Keys entered here are stored in your browser and included in exported config files.
        Only use <strong>public / publishable</strong> keys — never paste secret keys.
      </p>
      {SERVICES.map((svc) => (
        <ServiceRow
          key={svc.id}
          service={svc}
          value={integrations[svc.id] ?? ''}
          onChange={(v) => handleChange(svc.id, v)}
        />
      ))}
    </div>
  );
};

export default IntegrationsPanel;
