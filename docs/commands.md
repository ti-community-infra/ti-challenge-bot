# 命令设计

## issue 相关命令

### /pick-up
- 命令作用:
    - 认领任务，如果是多人协作完成，派一个代表 pick 即可，对外只是标记这个任务已经有人在处理了。
- 操作要求: 
    - 当前 issue 已经打上了 `challenge-program-${theme}`。
    - 当前 issue 无人 pick-up。
- 操作效果:
    - 为当前 issue 打上 `picked` 标签。
    - 在 issue 的描述中标明当前 challenger，格式如:
    `Current Challenger: @xxxx`
- **操作权限**:
    - GitHub User
    
### /give-up
- 命令作用:
    - give up 当前 pick 的 issue。
- 操作要求:
    - 当前 issue 已经被 pick-up，并打上了 `picked` 标签。
- 操作效果:
    - 移除 `picked` 标签。
    - 删除 issue 描述中的 challenger 标注。
- **操作权限**:
    - Current Challenger

## PR 相关命令

### /reward ${score}
- 命令作用:
    - 给当前 PR 指定分数。
- 操作要求:
    - 当前 PR 关联了 challenge 相关的 issue。
    - 当前 PR 作者与 issue 的 challenger 一致。
- 操作效果:
    - 记录 reward 分数给 PR。
    - 打上 `rewarded` 标签。
- **操作权限**:
    - 关联 issue 的 mentor。
