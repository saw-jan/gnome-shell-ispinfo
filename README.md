## Gnome Shell Extension: ISP Info

A simple Gnome Shell Extension to display the current ISP name in the top bar.

![topbar screenshot](screenshots/topbar.png)

![refresh menu screenshot](screenshots/refresh.png)

> [!IMPORTANT]
>
> **Depends on:**
>
> System commands:
>
> - `hostname`
> - `wget`
>
> API service:
>
> - [ip-api.com](http://ip-api.com)

### Installation

#### Check gnome-shell version

```bash
gnome-shell --version
```

#### For `<= 44` versions

[See older version](https://github.com/saw-jan/gnome-shell-ispinfo/tree/stable-1)

#### For `>= 45` versions

1. Download the latest extension [zip file](https://github.com/saw-jan/gnome-shell-ext-ispinfo/releases)
2. Extract the zip file to `~/.local/share/gnome-shell/extensions`
3. Enable the extension using the Extensions app
