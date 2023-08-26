+++
title = "Restore Windows boot entry lost during UEFI upgrade (error 1962)"

[taxonomies]
tags = [
    "windows",
]
+++

The UEFI(/BIOS) might fail to boot after a firmware upgrade if that upgrade causes it to lose NVRAM information about the operation systems installed. I specifically had to experience this on a Lenovo ThinkCentre, which after a firmware  upgrade failed to boot with this error:

```plain
Error 1962: No operating system found [...]
```

The easiest fix seems to be:

* Boot from a Windows 10 installation USB-stick in _UEFI-mode!_
* Once on the language selection screen, press <kbd>SHIFT</kbd>+<kbd>F10</kbd> to open a command prompt.
* Execute `bootrec /ScanOs` (capitalization does not matter) to see if the installer detects the existing Windows 10 installation.

    If it does, at least one entry in the form of `F:\Windows` should pop up (the driver-letter can change between reboots and is seldomly `C:`).
    If it doesn't, this guide will not help and different troubleshooting is required.

* Try executing `bootrec /RebuildBCD`.

    This will show you the detected installations.
    Usually you'll see one installation, but even if there are more: just accept the addition of the installations.

    Note that there is a high probability that this command will fail with some error indicating that the device or path are not accessible/not found.
    When this error occurs, try the next step.

    If it doesn't fail, try to reboot and check if booting works now.
    If booting still doesn't work, try the next step.

* What finally worked for me was using `bcdboot`, which is a tool to set up system partitions and repairing boot environments.

    Execute the following command, but replace the path with the path you identified earlier when you ran `bootrec /ScanOs`:

    ```
    bcdboot F:\Windows
    ```

    This should re-add the boot-entry for the Windows-installation in question to the UEFI's NVRAM, allowing it to boot again.

    If it fails, you can also try to provide a EFI-system-partition drive-letter via the `/s` option.
    Potentially due to sheer luck, I used `/s C:` and got a working system, in general though I think the `/s` should not be used unless the `bcdedit` step did not resolve the issue.
