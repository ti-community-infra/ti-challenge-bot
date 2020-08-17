# 命令设计

## issue 相关命令
- /pick-up-challenge
    - 作用: pick up 当前 challenge issue。
    - 要求: issue 必须满足 challenge 的 template 的要求。
    - 权限: anyone

- /give-up-challenege
    - 作用: give up 当前 pick 的 issue。
    - 要求: 当前 issue 被其 pick。
    - 权限: 当前 challenger。

## PR 相关命令
- /reward ${score}
    - 作用: 给当前 PR  reward。
    - 要求: 当前 PR 关联了 challenge issue。
    - 权限: 关联 issue 的 mentor。
