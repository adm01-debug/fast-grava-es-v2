import React, { ReactNode } from "react";

type ProviderComponent = React.ComponentType<{ children: ReactNode }>;

interface ProviderComposerProps {
  providers: ProviderComponent[];
  children: ReactNode;
}

export const ProviderComposer = ({ providers, children }: ProviderComposerProps) => {
  return (
    <>
      {providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
      }, children)}
    </>
  );
};
