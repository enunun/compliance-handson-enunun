<!-- このファイルは mise run ops:render で items.yaml から生成する．手で編集しない． -->

# 運用項目一覧

| ID | 項目 | 分類 | 要求 | 仕組み | 証跡 | タイミング | 実施者 | 手順書 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| change-management | 変更管理 | 運用管理 | SOC2:CC8.1<br>ISO27001:A.8.32 | ci.yml: check | ブランチ保護の設定(JSON)と，プルリクエストのレビュー記録 | 定常(変更ごと) | 自動 | [手順書](runbooks/emergency-change.md) |
| secret-detection | シークレット検出 | 運用管理 | ISO27001:A.5.17<br>ISO27001:A.8.4<br>SSDF:PS.1 | ci.yml: secrets | gitleaksの結果(JSON，キーは伏せ字)をCIのartifactとして保存 | 定常(変更ごと，コミットごと) | 自動 | [手順書](runbooks/secret-leak.md) |
