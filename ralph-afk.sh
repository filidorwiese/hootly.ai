#!/bin/bash -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "Iteration $i"
  echo "---------------------------"
  result=$(~/.claude/local/claude --permission-mode acceptEdits "@plans/prd.json @progress.txt \
  1. Find the highest-priority feature to work on and work only on that feature.\
  This should the one YOU decide has the highest priority - not necessarily the first one listed in the PRD. \
  2. Write unit-tests and/or e2e-tests using vitest for the feature. \
  3. Check that there are no type errors via npm typecheck and make sure tests pass via npm test. \
  4. Update the PRD with the work that was done. \
  5. Append your progress to the progress.txt file. \
  Use this to leave a note for the next person working in the codebase. \
  6. Make a git commit of that feature. \
  ONLY WORK ON A SINGLE FEATURE. \
  If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise>.")

  echo "$result"; echo

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "PRD complete after $i iterations."
    exit 0
  fi
done
