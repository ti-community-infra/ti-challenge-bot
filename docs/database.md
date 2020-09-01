# 数据库设计(out of date)

## 数据库建模
如下图所示：

![challenge_program](./assets/images/challenge_program.png)


## 数据库 SQL

```sql
CREATE TABLE IF NOT EXISTS `challenge_issues`
(
    `issue_id`                     int(11)      NOT NULL COMMENT 'issue id',
    `sig_id`                       int(11)      NOT NULL COMMENT 'issue sig id',
    `score`                        int(11)      NOT NULL COMMENT 'issue score',
    `mentor`                       varchar(255) NOT NULL COMMENT 'issue mentor',
    `has_picked`                   tinyint(1)   NOT NULL DEFAULT 0 COMMENT 'has picked',
    `current_challenger_github_id` varchar(255) NULL     DEFAULT NULL COMMENT 'current challenger github id',
    `picked_time`                  timestamp    NULL     DEFAULT NULL COMMENT 'picked time',
    `program_id`                   int(11)      NULL     DEFAULT NULL COMMENT 'porgram id',
    PRIMARY KEY (`issue_id`),
    INDEX `index_program_id` (`program_id` ASC),
    INDEX `index_issue_id` (`sig_id` ASC)
);
CREATE TABLE `challenge_pulls`
(
    `pulls_id` int(11) NOT NULL,
    `reward`   int(11) NOT NULL DEFAULT 0 COMMENT 'challenge pull request reward',
    `issue_id` int(11) NOT NULL COMMENT 'challenge issue',
    PRIMARY KEY (`pulls_id`),
    INDEX `index_issue_id` (`issue_id` ASC)
);
CREATE TABLE IF NOT EXISTS `programs`
(
    `id`            int(11)      NOT NULL AUTO_INCREMENT,
    `program_theme` varchar(255) NULL     DEFAULT NULL COMMENT 'challenge program theme',
    `program_name`  text         NULL COMMENT 'challenge program name',
    `progtam_desc`  text         NULL COMMENT 'challenge program description',
    `begin_at`      timestamp    NULL     DEFAULT NULL COMMENT 'challenge program begin time',
    `end_at`        timestamp    NULL     DEFAULT NULL COMMENT 'challenge program end time',
    `created_at`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'challenge program created time',
    `updated_at`    timestamp    NULL     DEFAULT NULL COMMENT 'challenge program last update time',
    PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `pulls`
(
    `id`          int(11)      NOT NULL AUTO_INCREMENT,
    `owner`       varchar(255) NULL     DEFAULT NULL COMMENT 'github repo owner',
    `repo`        varchar(255) NULL     DEFAULT NULL COMMENT 'github repo',
    `pull_number` int(11)      NULL     DEFAULT NULL COMMENT 'github pull request number',
    `title`       text         NULL COMMENT 'github pull request title',
    `body`        text         NULL COMMENT 'github pull request body',
    `user`        varchar(255) NULL     DEFAULT NULL COMMENT 'github pull request author',
    `association` varchar(255) NULL     DEFAULT NULL COMMENT 'github role in this repo',
    `relation`    varchar(255) NULL     DEFAULT NULL COMMENT 'is org member',
    `label`       text         NULL COMMENT 'github pull request labels',
    `status`      varchar(128) NULL     DEFAULT NULL COMMENT 'github pull request status',
    `created_at`  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
    `updated_at`  timestamp    NULL     DEFAULT NULL COMMENT 'update time',
    `closed_at`   timestamp    NULL     DEFAULT NULL COMMENT 'close time',
    `merged_at`   timestamp    NULL     DEFAULT NULL COMMENT 'merge time',
    PRIMARY KEY (`id`),
    INDEX `index_pull_number` (`pull_number` ASC)
);
CREATE TABLE IF NOT EXISTS `issues`
(
    `id`           int(11)      NOT NULL AUTO_INCREMENT,
    `owner`        varchar(255) NULL     DEFAULT NULL COMMENT 'github repo owner',
    `repo`         varchar(255) NULL     DEFAULT NULL COMMENT 'github repo',
    `issue_number` int          NULL     DEFAULT NULL COMMENT 'github issue number',
    `title`        text         NULL COMMENT 'github issue title',
    `body`         text         NULL COMMENT 'github issue body',
    `user`         varchar(255) NULL     DEFAULT NULL COMMENT 'giithub issue author',
    `association`  varchar(255) NULL     DEFAULT NULL COMMENT 'github role in this repo',
    `relation`     varchar(255) NULL     DEFAULT NULL COMMENT 'is org member',
    `label`        text         NULL COMMENT 'github issue labels',
    `status`       varchar(128) NULL     DEFAULT NULL COMMENT 'github issue state',
    `created_at`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
    `updated_at`   timestamp    NULL COMMENT 'update time',
    `closed_at`    timestamp    NULL     DEFAULT NULL COMMENT 'close time',
    PRIMARY KEY (`id`),
    INDEX `index_issue_number` (`issue_number` ASC)
);
CREATE TABLE IF NOT EXISTS `sig`
(
    `id`          int          NOT NULL AUTO_INCREMENT,
    `name`        varchar(255) NULL     DEFAULT NULL COMMENT 'sig name',
    `info`        varchar(255) NULL     DEFAULT NULL COMMENT 'sig info',
    `sig_url`     varchar(255) NULL     DEFAULT NULL COMMENT 'sig url in the community repo',
    `create_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'sig create time',
    `channel`     varchar(255) NULL     DEFAULT NULL,
    `update_time` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'sig update time',
    `status`      int          NOT NULL DEFAULT 0,
    `lgtm`        int          NULL     DEFAULT 2 COMMENT 'require lgtm number',
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
);
CREATE TABLE IF NOT EXISTS `github_label_sig`
(
    `id`             int(11)      NOT NULL AUTO_INCREMENT,
    `repo`           varchar(255) NULL DEFAULT NULL COMMENT 'github repo',
    `label`          varchar(255) NULL DEFAULT NULL COMMENT 'sig label',
    `info`           varchar(255) NULL DEFAULT NULL COMMENT 'label info',
    `project_sig_id` int          NULL DEFAULT NULL COMMENT 'project sig id',
    PRIMARY KEY (`id`),
    UNIQUE KEY `repo` (`repo`, `label`)
);
CREATE TABLE IF NOT EXISTS `project_sig`
(
    `sig_id`         int(11)      NULL COMMENT 'sig id ',
    `repo`           varchar(255) NULL     DEFAULT NULL COMMENT 'github repo name',
    `project_url`    varchar(255) NOT NULL COMMENT 'github project url',
    `create_time`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'project create time',
    `project_sig_id` int          NOT NULL AUTO_INCREMENT COMMENT 'project sig id',
    PRIMARY KEY (`project_sig_id`),
    UNIQUE KEY `project_url` (`project_url`),
    UNIQUE KEY `sig_id` (`sig_id`, `repo`)
);

ALTER TABLE `sig`
    ADD CONSTRAINT `fk_sig_projects` FOREIGN KEY (`id`) REFERENCES `project_sig` (`sig_id`);
ALTER TABLE `pulls`
    ADD CONSTRAINT `fk_pull_challenge_pulls` FOREIGN KEY (`id`) REFERENCES `challenge_pulls` (`pulls_id`);
ALTER TABLE `issues`
    ADD CONSTRAINT `fk_issue_challenge_issues` FOREIGN KEY (`id`) REFERENCES `challenge_issues` (`issue_id`);
ALTER TABLE `programs`
    ADD CONSTRAINT `fk_program_issues` FOREIGN KEY (`id`) REFERENCES `challenge_issues` (`program_id`);
ALTER TABLE `challenge_issues`
    ADD CONSTRAINT `fk_challenge_issue_challenge_pulls` FOREIGN KEY (`issue_id`) REFERENCES `challenge_pulls` (`issue_id`);
ALTER TABLE `sig`
    ADD CONSTRAINT `fk_sig_challenge_issues` FOREIGN KEY (`id`) REFERENCES `challenge_issues` (`sig_id`);
```
