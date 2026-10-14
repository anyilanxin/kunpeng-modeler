#!/usr/bin/env bash
#
# 带 OTP 的批量发布兜底方案:不改动账号 2FA 设置,直接用动态口令发布。
# 自动跳过已发布的版本,口令过期后换新口令重跑即可续传。
#
# 用法:
#   pnpm publish:npm:otp                # 首次:先构建全部产物,再提示输入 OTP
#   SKIP_BUILD=1 pnpm publish:npm:otp   # 续传:跳过构建,输入新 OTP 继续
set -euo pipefail

cd "$(dirname "$0")/.."

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo '==> 构建全部库包与 dmn-js distro 产物'
  pnpm build:packages
  pnpm -F '@kunpeng-js/dmn-js' run distro
fi

# 按依赖拓扑顺序枚举,拆出尚未发布的包
pending=()
for dir in $(pnpm -r -F './packages/bpm/*' -F './packages/bpmn/*' -F './packages/dmn/*' exec pwd | grep '/packages/'); do
  name=$(node -p "require('$dir/package.json').name")
  version=$(node -p "require('$dir/package.json').version")

  if npm view "$name@$version" version >/dev/null 2>&1; then
    echo "跳过(已发布): $name@$version"
  else
    pending+=("$dir")
  fi
done

if [ "${#pending[@]}" -eq 0 ]; then
  echo '全部包均已发布,无事可做。'
  exit 0
fi

echo "待发布:${#pending[@]} 个包"
read -r -p '输入当前 6 位动态口令(OTP): ' otp
echo

# --ignore-scripts:产物已在上面构建,发布阶段不再逐包跑钩子,
# 确保一次口令的有效窗口内能发完尽可能多的包。
for dir in "${pending[@]}"; do
  echo ">>> $(basename "$(dirname "$dir")")/$(basename "$dir")"
  (cd "$dir" && pnpm publish --access public --publish-branch main --ignore-scripts --otp "$otp")
done

echo '完成。'
