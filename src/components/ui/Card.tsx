import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={`card ${className}`.trim()} {...rest}>
      {children}
    </section>
  )
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <footer className="card-footer">{children}</footer>
}
