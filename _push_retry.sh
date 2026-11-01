#!/bin/sh
cd /e/Doc/jjk_gh
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  echo "=== attempt $i $(date '+%H:%M:%S') ==="
  out=$(GIT_TERMINAL_PROMPT=0 git push origin main 2>&1)
  echo "$out" | tail -2
  if echo "$out" | grep -q "main -> main"; then echo "PUSH_OK"; break; fi
  sleep 20
done
git ls-remote origin refs/heads/main 2>&1 | head -1
