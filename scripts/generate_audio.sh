#!/bin/bash
# Generate JRT Ad narration - FINAL version with correct prices for 7 products
set -e

OUTDIR="/Users/max0056/jrt-motion-ad/public/audio"
VOICE="en-US-AriaNeural"
RATE="+5%"
PFAST="+15%"  # faster rate for products section (longer script)

echo "=== Generating JRT Ad Audio (Female: AriaNeural) ==="

# Title: ~8s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Jade Rose Technology. Digital products that work for you." \
  --write-media "$OUTDIR/01-title.mp3"

# Mission: ~13s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Simple tools. Real results. No guesswork. Purpose-driven features, no subscriptions ever, designed for ease of use, and your data stays on your device." \
  --write-media "$OUTDIR/02-mission.mp3"

# Products: needs ~26s for 7 products — use faster rate
edge-tts --voice "$VOICE" --rate="$PFAST" --text \
  "Food Vendor. Serve fast, sell smart. Starts at seventy-nine dollars for one device. LawnCare Manager. Manage jobs, grow your business. Starts at seventy-nine dollars for one device. Fresh Market Vendor. From farm stand to online storefront. Starts at seventy-nine dollars for one device. Farm Land Manager. Track your land, your way. Thirty-nine dollars for one device. HerdLook. Camera-powered herd management. Forty-nine dollars for one device. FLM plus HerdLook Bundle. Both for seventy-nine dollars for one device. Idea Validator. Free. Test your business ideas before you invest. All paid apps support up to two devices for forty percent more." \
  --write-media "$OUTDIR/03-products.mp3"

# Services: ~13s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Need something custom built? We make apps for farms, e-commerce, restaurants, and more. Starting at just seventy-nine dollars." \
  --write-media "$OUTDIR/04-services.mp3"

# Trust: ~14s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Why JRT? Smooth, intuitive experience. Data stays private. Secure Stripe checkout. And no subscriptions, ever. One purchase, yours forever." \
  --write-media "$OUTDIR/05-trust.mp3"

# CTA: ~14s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Ready to build something great? Visit Jade Rose Tech dot com. Browse our apps, try Idea Validator for free, or get a custom build starting at seventy-nine dollars." \
  --write-media "$OUTDIR/06-cta.mp3"

echo ""
echo "=== Audio Duration Check ==="
for f in "$OUTDIR"/*.mp3; do
  dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
  echo "$(basename $f): ${dur}s"
done