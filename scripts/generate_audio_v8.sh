#!/bin/bash
# Generate JRT Ad narration v8 — 8-section structure, NO PRICES
set -e

OUTDIR="/Users/max0056/jrt-motion-ad/public/audio"
VOICE="en-US-AriaNeural"
RATE="+5%"
PFAST="+15%"

echo "=== Generating JRT Ad Audio v8 (8-section, price-free) ==="

# Clean: remove old section audio files
rm -f "$OUTDIR"/01-title.mp3 "$OUTDIR"/02-mission.mp3 "$OUTDIR"/03-products.mp3 "$OUTDIR"/04-services.mp3 "$OUTDIR"/05-trust.mp3 "$OUTDIR"/06-cta.mp3

# Section 1: Opening / Brand Hook (~8s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Jade Rose Technology. Simple web apps for small businesses, farms, and vendors." \
  --write-media "$OUTDIR/01-opening.mp3"

# Section 2: The Problem (~12s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Running a small business should not feel scattered. Many small businesses still manage orders, records, services, and customer requests with scattered tools." \
  --write-media "$OUTDIR/02-problem.mp3"

# Section 3: The Solution (~15s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Our ready-made starter apps are customized with your business details, so you can launch faster and stay organized. Pick a starter app. Send your business details. Launch when it is ready." \
  --write-media "$OUTDIR/03-solution.mp3"

# Section 4: App Types (~23s)
edge-tts --voice "$VOICE" --rate="$PFAST" --text \
  "Food Vendor. Menus, order requests, and customer pages. LawnCare Manager. Booking requests and service workflows. Fresh Market Vendor. Products, pickup details, and vendor info. Farm Land Manager. Fields, land notes, and farm records. HerdLook. Animal records, photos, and herd notes. Idea Validator. Test your idea before building." \
  --write-media "$OUTDIR/04-apptypes.mp3"

# Section 5: Workflow (~17s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Choose your app. Send your business details. Review your custom build. Launch and start using it." \
  --write-media "$OUTDIR/05-workflow.mp3"

# Section 6: Demo Screenshots (~20s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "See the apps in action. Customer order pages. Admin dashboards. Records managers. Simple, clear, and easy to use on any device." \
  --write-media "$OUTDIR/06-demo.mp3"

# Section 7: Trust / Why JRT (~13s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Built for practical business use. Simple setup. Custom business details. Mobile-friendly pages. Stripe-ready structure. No subscriptions, ever. One purchase, yours forever." \
  --write-media "$OUTDIR/07-trust.mp3"

# Section 8: CTA (~12s)
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Ready to build something useful for your business? Visit Jade Rose Tech dot com. Or call 252-592-1266. Start your app build today." \
  --write-media "$OUTDIR/08-cta.mp3"

echo ""
echo "=== Audio Duration Check ==="
for f in "$OUTDIR"/0*.mp3 "$OUTDIR"/bg-music.mp3; do
  dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
  echo "$(basename $f): ${dur}s"
done