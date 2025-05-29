# opencascade 构建

1. 基于此目录
2. 打开docker
3. 终端执行

``` bash
docker run \
  --rm \
  -it \
  -v "$(pwd):/src" \
  -u "$(id -u):$(id -g)" \
  donalffons/opencascade.js \
  custom-build.yml
```

> 参考：<https://ocjs.org/docs/app-dev-workflow/custom-builds>
