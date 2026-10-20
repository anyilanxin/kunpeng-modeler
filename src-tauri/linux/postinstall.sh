#!/bin/bash
# 安装后刷新 MIME 数据库与图标缓存，让 .bpmn/.dmn 显示专属图标
set -e

if command -v update-mime-database >/dev/null 2>&1; then
  update-mime-database /usr/share/mime || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache -f /usr/share/icons/hicolor || true
fi

exit 0
