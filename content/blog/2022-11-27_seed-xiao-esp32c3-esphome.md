+++
title = "Seeed XIAO ESP32C3: adopt into ESPHome"

[taxonomies]
tags = [
    "esp32",
    "esphome",
    "hardware",
    "home-assistant",
]
+++

Available information on using the Seeed XIAO ESP32C3 with ESPHome differs.
In relatively up-to-date versions of ESPHome, this board configuration worked for me:

```yaml
esp32:
  board: esp32-c3-devkitm-1
  variant: esp32c3
  framework:
    type: arduino
```

The steps for adding a new Seeed XIAO ESP32C3 board to ESPHome in Home Assistant that reliably worked for me are:

* Open ESPHome, click on "New Device", click on "Continue".
* Give your configuration a name.
* Select "ESP32-C3" then click on "Skip".
* Click on "Edit" for your new configuration.
* To the `esp32` section, add the variant-key:

    ```yaml
    variant: esp32c3
    ```

* Modify and then install the configuration using your preferred way.

    For me "Manual download" and using ESPHome Web worked most reliably.
    You have to press the "Boot" button on the board before connecting it to put it into flashing mode.

> **_Note:_** there is a board called `seeed_xiao_esp32c3`.
I recall trying that without much success, but maybe that has improved since I last tried.

> **_Additional note:_** if a BSSID-based Wifi is used, fast-connect has to be enabled:
>
> ```yaml
> wifi:
>   fast_connect: true
> ```
