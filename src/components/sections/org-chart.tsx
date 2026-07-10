import type { ReactNode } from "react";

function Box({
  children,
  variant = "outline",
}: {
  children: ReactNode;
  variant?: "solid" | "outline";
}) {
  return (
    <div
      className={
        variant === "solid"
          ? "inline-flex max-w-48 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm"
          : "inline-flex max-w-48 items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-medium text-foreground shadow-sm"
      }
    >
      {children}
    </div>
  );
}

function BoxWithList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="inline-flex min-w-40 flex-col items-start rounded-lg border border-border bg-card px-4 py-2.5 text-left shadow-sm">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-1.5 space-y-0.5">
        {items.map((item) => (
          <div key={item} className="text-xs whitespace-nowrap text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrgChart() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="org-chart mx-auto w-max py-4">
        <ul>
          <li>
            <Box variant="solid">Consiliul de Administrație</Box>
            <ul>
              <li>
                <BoxWithList
                  title="Compartimentul Administrativ"
                  items={["Secretar", "Casier", "Administrator", "Bibliotecar"]}
                />
              </li>
              <li>
                <Box variant="solid">Bordul Director</Box>
                <ul>
                  <li>
                    <Box>Consiliul Profesoral</Box>
                    <ul>
                      <li>
                        <Box>Comisia Metodică</Box>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <BoxWithList
                      title="Catedre"
                      items={[
                        "Teologie Sistematică și Apologetică",
                        "Teologie Biblică",
                        "Teologie Practică",
                      ]}
                    />
                  </li>
                </ul>
              </li>
              <li>
                <Box>Pastorul comunității academice</Box>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}
