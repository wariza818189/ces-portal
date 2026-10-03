import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { getVolunteerQr } from "@/lib/volunteer-qr";
import styles from "./poster.module.css";

export default async function VolunteerPosterPage() {
  await connection();
  const qr = await getVolunteerQr();
  return (
    <div className={styles.page}>
      <nav className={styles.controls} aria-label="Poster navigation">
        <Link href="/volunteers" prefetch={false}>Back to Volunteer Submissions</Link>
        <p>Use your browser’s Print command to print this poster.</p>
      </nav>
      <article className={styles.poster}>
        <p className={styles.eyebrow}>Community Extension Services</p>
        <h1>Volunteer Signup</h1>
        <p>Join the CES volunteer demonstration. Open the signup form to explore how students can take part.</p>
        {qr.state === "available" ? (
          <Image className={styles.qr} src={qr.image} width={600} height={600} unoptimized alt="QR code opening the configured Volunteer Signup page" />
        ) : (
          <p className={styles.status} role="status">{qr.state === "not_configured"
            ? "The Volunteer Signup link is not configured for this demo."
            : "QR generation is temporarily unavailable. Please use the Volunteer Signup link below."}</p>
        )}
        <h2>Scan to open Volunteer Signup</h2>
        {qr.state !== "not_configured" && <a className={styles.url} href={qr.url}>{qr.url}</a>}
        <aside className={styles.warning}>
          <strong>SYNTHETIC / LOCAL DEMO ONLY</strong>
          <p>Real personal-information collection is not approved. Use synthetic test information only.</p>
        </aside>
      </article>
    </div>
  );
}
