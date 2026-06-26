import { redirect } from "next/navigation";

export default function ContractsIndexRedirect() {
  redirect("/dashboard");
}
