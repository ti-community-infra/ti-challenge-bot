# 命令设计

## issue 相关命令
- /pick-up
    - 作用: 认领任务，如果是多人协作完成，派一个代表 pick 即可，对外只是标记这个任务已经有人在处理了。 pick-up 完毕后，该 issue 会自动打上 picked 标签。
    - 要求: issue 必须满足 challenge 的 template 的要求。
    - 权限: anyone

- /give-up
    - 作用: give up 当前 pick 的 issue，该 issue 的 picked 标签会被移除。
    - 要求: 当前 issue 被其 pick。
    - 权限: 当前 challenger。

## PR 相关命令
- /reward ${score}
    - 作用: 给当前 PR  reward。
    - 要求: 当前 PR 关联了 challenge issue。
    - 权限: 关联 issue 的 mentor。
