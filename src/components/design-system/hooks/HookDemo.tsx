import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Code } from "lucide-react";

export const HookDemo = ({
  title,
  description,
  code,
  children,
  icon: Icon = Code
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <Card className="card-interactive">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        {children}
      </div>
      <CodeBlock code={code} label="Código" />
    </CardContent>
  </Card>
);
