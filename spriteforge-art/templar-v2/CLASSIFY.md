# 472 classification (32 cells)

Source is a JPEG photo of a sprite sheet, 8×4 of 180px. Facing follows the
silhouette (chest cross = down, full cape/back-of-helm = up, profile = side).
Owner brief called row1 'front slash' and row3 'back'; pixels show the opposite.

| cell | facing | kind | notes |
|------|--------|------|-------|
| r0c0 | down | WALK idle | chest cross, visor, cape L, sword R |
| r0c1 | down | WALK | |
| r0c2 | down | WALK | |
| r0c3 | down | WALK stride | |
| r0c4 | down | WALK | |
| r0c5 | down | WALK | |
| r0c6 | down | WALK | |
| r0c7 | down | WALK | |
| r1c0 | up | WALK idle | full cape, no chest cross |
| r1c1 | up | WALK | |
| r1c2 | up | WALK | |
| r1c3 | up | SLASH anticipation | sword raised |
| r1c4 | up | SLASH swing | |
| r1c5 | up | SLASH HIT | yellow arc |
| r1c6 | up | SLASH recovery | |
| r1c7 | up | WALK | |
| r2c0 | right | WALK idle | cape L, sword R |
| r2c1 | right | WALK | |
| r2c2 | right | WALK | |
| r2c3 | right | SLASH anticipation | |
| r2c4 | right | SLASH swing | |
| r2c5 | right | SLASH HIT | yellow arc on the right |
| r2c6 | (leak) | unused | 3/4-front, not profile |
| r2c7 | (leak) | unused | 3/4-front, not profile |
| r3c0 | left | WALK | native left, shield leading |
| r3c1 | left | WALK idle | |
| r3c2 | left | WALK | |
| r3c3 | left | SLASH anticipation | |
| r3c4 | left | SLASH swing | |
| r3c5 | left | SLASH HIT | yellow arc on the left |
| r3c6 | left | SLASH recovery | |
| r3c7 | left | WALK | |

Attack down has no slash in row 0 — painted on the idle-down puppet.
Left is native row 3, not a horizontal flip of right (shield stays world-left).
