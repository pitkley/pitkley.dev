+++
title = "Disable Logitech high-resolution smooth scrolling under Linux"
updated = "2023-04-12"

[taxonomies]
tags = [
    "linux",
]
+++

I had problems with `libinput`'s high-resolution/smooth scrolling feature introduced in v1.19 in certain applications, using a Logitech MX Master 3.
Following [this Reddit comment](https://www.reddit.com/r/archlinux/comments/puiysn/comment/hey8d12/) and from v1.23 onwards [this Reddit comment](https://www.reddit.com/r/archlinux/comments/puiysn/comment/jesa41v/), I did the following:

* Create/modify `/etc/libinput/local-overrides.quirks` and add the following:

    {{ tab_container() }}
    {% tab(name="libinput >=v1.23", active=true) %}
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
{% end %}
{% tab(name="libinput >=v1.19, <v1.23") %}
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
{% end %}

* Reboot.
