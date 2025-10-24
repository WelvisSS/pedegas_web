/**
 * Reusable Card Component
 * Following Single Responsibility Principle
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '', ...props }: CardProps) => {
  const classes = `card p-6 ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
