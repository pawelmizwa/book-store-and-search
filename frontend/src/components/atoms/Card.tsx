type Props = {
  children: React.ReactNode;
  title: string;
};

export function Card({ children, title }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-4">
      <p className="font-bold">{title}</p>
      {children}
    </div>
  );
}
