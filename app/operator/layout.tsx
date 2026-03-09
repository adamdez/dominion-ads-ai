import { OperatorShell } from '@/components/layout/operator-shell';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperatorShell>{children}</OperatorShell>;
}
