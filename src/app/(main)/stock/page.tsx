import { redirect } from "next/navigation";

/** O stock passou para a página inicial (`/`). Mantém o URL para marcadores antigos. */
export default function StockPage() {
  redirect("/");
}
