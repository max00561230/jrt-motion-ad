#!/bin/bash
# Generate JRT Ad narration - final version with female voice
set -e

OUTDIR="/Users/max0056/jrt-motion-ad/public/audio"
VOICE="en-US-AriaNeural"
RATE="+5%"
PFAST="+15%"  # faster rate for products section (longer script)

echo "=== Generating JRT Ad Audio (Female: AriaNeural) ==="

# Title: 8.1s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Jade Rose Technology. Digital products that work for you." \
  --write-media "$OUTDIR/01-title.mp3"

# Mission: 13.6s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Simple tools. No bloat. No guesswork. Purpose-driven features, no subscriptions ever, offline-first so it works everywhere, and your data stays on your device." \
  --write-media "$OUTDIR/02-mission.mp3"

# Products: 16.7s available — needs to be concise for scrolling screenshots
edge-tts --voice "$VOICE" --rate="$PFAST" --text \
  "Farm Land Manager. Track your land and goals. Forty-nine dollars, one time. HerdLook. Camera-powered cattle records. Seventy-nine dollars, one time. Idea Validator. Free. Test your business ideas before you invest." \
  --write-media "$OUTDIR/03-products.mp3"

# Services: 13.8s available — $79 price
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Need something custom built? We make apps for farms, e-commerce, restaurants, and more. Starting at just seventy-nine dollars." \
  --write-media "$OUTDIR/04-services.mp3"

# Trust: 14.6s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Why JRT? Offline always. Data stays private. Secure Stripe checkout. And no subscriptions, ever. One purchase, yours forever." \
  --write-media "$OUTDIR/05-trust.mp3"

# CTA: 14.3s available
edge-tts --voice "$VOICE" --rate="$RATE" --text \
  "Ready to build something great? Visit jaderosetech dot com. Browse our apps, try Idea Validator for free, or get a custom build starting at seventy-nine dollars." \
  --write-media "$OUTDIR/06-cta.mp3"

echo ""
echo "=== Audio Duration Check ==="
declare -A SLOTS=( ["01-title"]="8.1" ["02-mission"]="13.6" ["03-products"]="16.7" ["04-services"]="13.8" ["05-trust"]="14.6" ["06-cta"]="14.3" )
for f in "$OUTDIR"/*.mp3; do
  dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null)
  name=$(basename $f .mp3)
  slot=${SLOTS[$name]}
  status="✓"
  awk -v a="$dur" -v b="$slot" 'BEGIN { if (a+0 > b+0) print "OVERFLOW"; else print "OK"; }' | grep -q OVERFLOW && status="⚠️ OVERFLOW"
  echo "$(basename $f): ${dur}s (slot: ${slot}s) $status"
done