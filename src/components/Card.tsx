import type { ReactNode } from 'react';
import type { DataSource } from '../domain/types';
import { SourceBadge } from './SourceBadge';

interface CardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  source?: DataSource;
  tools?: ReactNode;
  className?: string;
  children: ReactNode;
  /** Heading id so regions can be labelled for screen readers. */
  id?: string;
}

export function Card({ title, subtitle, source, tools, className = '', children, id }: CardProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section className={`card ${className}`} aria-labelledby={headingId}>
      <div className="card-head">
        <div className="card-titles">
          <h2 className="card-title" id={headingId}>
            {title}
          </h2>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {(tools || source) && (
          <div className="card-tools">
            {tools}
            {source && <SourceBadge source={source} />}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
