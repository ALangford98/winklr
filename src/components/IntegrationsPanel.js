import React, { useContext, useState } from 'react';
import { AppContext } from './appContext';

const SERVICES = [
  {
    id:          'firebaseDatabaseUrl',
    label:       'Firebase Realtime Database',
    description: 'Enables live shared reservation state in Registry mode: guests see each other\'s reservations in real time.',
    placeholder: 'https://your-project-default-rtdb.firebaseio.com',
    docsHref:    'https://console.firebase.google.com/',
    isPublicUrl: true,
    setupNote:   'In Firebase Console → Realtime Database → Rules, paste: { "rules": { "reservations": { ".read": true, ".write": true }, "suggestions": { ".read": true, ".write": true }, "cashPledges": { ".read": true, ".write": true }, "guests": { ".read": false, ".write": true } } } — this limits access to just the paths the app uses, and keeps the guest access log (which contains emails) write-only so nobody can download it.',
    isMalformed: (v) => !/^https?:\/\/.+/i.test(v.trim()),
    malformedWarn: 'This doesn\'t look like a full web address (it should start with https://). Live sync won\'t work until this is the real database URL from Firebase Console.',
  },
  {
    id:          'stripePublishableKey',
    label:       'Stripe',
    description: 'Publishable key for Stripe Elements card tokenisation.',
    placeholder: 'pk_live_… or pk_test_…',
    docsHref:    'https://dashboard.stripe.com/apikeys',
    isSecret:    (v) => v.startsWith('sk_'),
    secretWarn:  'This looks like a Stripe secret key (starts with sk_). Only paste publishable keys (pk_) here - secret keys must never leave your server.',
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
  {
    id:          'ownerPasscode',
    label:       'Owner passcode',
    description: 'Optional. When set, switching into Edit Mode (and the owner view in an exported site) asks for this passcode first. This only stops casual guests from wandering into owner controls - it is checked in the browser, not on a server, so do not reuse a password you care about and do not treat it as real security. The exported website only ever contains a scrambled fingerprint (SHA-256 hash) of it, never the passcode itself.',
    placeholder: 'e.g. a short word or phrase',
  },
];

function StatusBadge({ value, isSecret }) {
  if (!value) return <span className="integration-badge integration-badge--off">Not configured</span>;
  if (isSecret && isSecret(value)) return <span className="integration-badge integration-badge--warn">⚠ Secret key detected</span>;
  return <span className="integration-badge integration-badge--ok">Configured</span>;
}

function ServiceRow({ service, value, onChange }) {
  const [show, setShow] = useState(false);
  const warn = value && service.isSecret && service.isSecret(value);
  const malformed = value && service.isMalformed && service.isMalformed(value);

  return (
    <div className={`integration-row${warn ? ' integration-row--warn' : ''}`}>
      <div className="integration-row-header">
        <span className="integration-label">{service.label}</span>
        <StatusBadge value={value} isSecret={service.isSecret} />
      </div>
      <p className="integration-description">{service.description}</p>
      {warn && <p className="integration-secret-warn">{service.secretWarn}</p>}
      {!warn && malformed && <p className="integration-secret-warn">{service.malformedWarn}</p>}
      {service.setupNote && !value && (
        <p className="integration-setup-note">{service.setupNote}</p>
      )}

      <div className="integration-input-wrap">
        <input
          className="integration-input"
          type={service.isPublicUrl || show ? 'text' : 'password'}
          placeholder={service.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {!service.isPublicUrl && (
          <button
            className="integration-toggle"
            type="button"
            onClick={() => setShow((s) => !s)}
            title={show ? 'Hide' : 'Show'}
          >
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>

      {value && (
        <button className="integration-clear" type="button" onClick={() => onChange('')}>
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
        Only use <strong>public / publishable</strong> keys - never paste secret keys.
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
