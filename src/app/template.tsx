// Se re-montează la fiecare navigare (spre deosebire de layout), deci animația
// de intrare rulează pe conținutul fiecărei pagini noi. Header/Footer nu sunt afectate.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
