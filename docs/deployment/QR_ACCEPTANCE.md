# Volunteer QR — configuration and presentation acceptance

The server reads **`VOLUNTEER_SIGNUP_URL` at runtime** in
`lib/volunteer-qr.ts`. It is not a `NEXT_PUBLIC_*` variable and is not inferred
from the current request host. The dynamic poster at `/volunteers/poster`
requires staff sign-in. No Azure App Setting was changed by these tasks.

The exact intended App Service setting is:

```text
VOLUNTEER_SIGNUP_URL=https://ces-portal-demo-2026-gwhzg4c0hadshmd9.eastasia-01.azurewebsites.net/volunteer
```

Use the value without spaces, credentials, query or fragment. The existing
validator accepts an absolute HTTP(S) URL whose path is `/volunteer` or
`/volunteer/`, at most 1024 UTF-8 bytes. The intended deployed value above is
HTTPS. Invalid/unset configuration makes no provider call and shows a clear
configuration message; the poster no longer asks the viewer to scan an absent
QR. An operator must approve and set this non-secret runtime value through the
existing Azure configuration process. No new resource/provider/key is needed.

## Unchanged provider and fallback behavior

- Existing server-side POST to `https://quickchart.io/qr`, JSON payload: text is
  exactly the configured public URL; format PNG, size 600, margin 4, correction
  level M, black foreground / white background.
- Five-second timeout, no redirects, successful PNG response required, 512 KiB
  cap, signature and full single-frame 600×600 decoding validation.
- Successful output is cached for 24 hours by URL/renderer hash. Failures are
  not cached as successful unavailable results. A changed URL has a new key.
- Available QR: display image and exact clickable direct URL. Provider failure:
  show a clear fallback and the same direct URL. Invalid configuration: no
  invented URL or image. The academic/no-real-information notice remains in
  screen and print views.

## Acceptance after the controlled deployment/configuration

1. In Azure's existing App Service `ces-portal-demo-2026`, have the authorized
   operator review/set the exact runtime variable above and confirm the process
   has restarted with that value. Preserve every other setting and credential.
2. Sign in as existing ADMIN or STAFF. Open Volunteers → Volunteer Signup
   poster. Expect an actual QR image, direct URL and prototype notice; no
   configuration/unavailable message. Verify the image is 600×600 at source,
   rendered without distortion; no relevant console or application error.
3. Open/copy the direct URL and compare **every character** to the intended
   value. It must open public Volunteer Registration without staff login and
   prominently prohibit real personal/contact information. The QR is generic;
   it must not contain a Volunteer name/contact, token or selected Activity ID.
4. Scan the screen QR with a separate phone on mobile data or another reachable
   network. Inspect the destination **before opening**. Expect the exact HTTPS
   `/volunteer` URL and usable registration at 360/390px. Submit only an approved
   fictional fixture if a write is separately authorized. Merely scanning and
   opening needs no data submission. Record device, result and actual date.
5. Browser Print → A4 portrait → inspect preview: staff sidebar/header,
   prototype shell strip and navigation controls are hidden; poster title,
   roughly 74 mm square QR, wrapped full direct URL and public prototype notice
   fit legibly. Keep a white quiet zone and no clipping. Print one copy and
   scan that copy with the phone. Record physical-print/phone results separately
   from browser or PDF preview; do not infer physical acceptance from CSS.
6. If provider access fails, verify the direct URL still works. Do not label
   this as API/QR success or add another provider. Inspect approved server logs
   for the existing bounded failure code; do not expose credentials or submitted
   data. Resolve the provider/configuration issue and repeat steps 2–5.

Automated checks exercise configuration rejection, exact payload, valid-image
rendering, direct link and provider-failure fallback with a synthetic PNG. That
PNG is deliberately not a real QR and does **not** prove scanning. Live/local
provider, phone and physical-print outcomes are recorded separately in
[PRESENTATION_QA](PRESENTATION_QA.md).
