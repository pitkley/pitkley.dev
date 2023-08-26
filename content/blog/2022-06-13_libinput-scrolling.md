+++
title = "Disable Logitech high-resolution smooth scrolling under Linux"

[taxonomies]
tags = [
    "linux",
]
+++

I had problems with `libinput`'s high-resolution/smooth scrolling feature introduced in v1.19 in certain applications, using a Logitech MX Master 3.
Following [this Reddit comment](https://www.reddit.com/r/archlinux/comments/puiysn/comment/hey8d12/) and from v1.23 onwards [this Reddit comment](https://www.reddit.com/r/archlinux/comments/puiysn/comment/jesa41v/), I did the following:

* Create/modify `/etc/libinput/local-overrides.quirks` and add the following:

    ```ini
    [Logitech MX Master 3]
    MatchVendor=0x46D
    MatchProduct=0x4082
    ModelInvertHorizontalScrolling=1
    AttrEventCode=-REL_WHEEL_HI_RES;-REL_HWHEEL_HI_RES;

    # MX Master 3 has a different PID on bluetooth
    [Logitech MX Master 3]
    MatchVendor=0x46D
    MatchProduct=0xB023
    ModelInvertHorizontalScrolling=1
    AttrEventCode=-REL_WHEEL_HI_RES;-REL_HWHEEL_HI_RES;
    ```

* Reboot.

---

If you are on a `libinput` version from v1.19 but lower than v1.23, you can use the following content for `/etc/libinput/local-overrides.quirks` instead:

```ini
[Logitech MX Master 3]
MatchVendor=0x46D
MatchProduct=0x4082
ModelInvertHorizontalScrolling=1
AttrEventCodeDisable=REL_WHEEL_HI_RES;REL_HWHEEL_HI_RES;

# MX Master 3 has a different PID on bluetooth
[Logitech MX Master 3]
MatchVendor=0x46D
MatchProduct=0xB023
ModelInvertHorizontalScrolling=1
AttrEventCodeDisable=REL_WHEEL_HI_RES;REL_HWHEEL_HI_RES;
```
