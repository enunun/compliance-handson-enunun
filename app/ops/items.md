<!-- このファイルは mise run ops:render で items.yaml から生成する．手で編集しない． -->

# 運用項目一覧

| ID | 項目 | 分類 | 要求 | 仕組み | 証跡 | タイミング | 実施者 | 手順書 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| change-management | 変更管理 | 運用管理 | SOC2:CC8.1<br>ISO27001:A.8.32 | ci.yml: check | ブランチ保護の設定(JSON)と，プルリクエストのレビュー記録 | 定常(変更ごと) | 自動 | [手順書](runbooks/emergency-change.md) |
| secret-detection | シークレット検出 | 運用管理 | ISO27001:A.5.17<br>ISO27001:A.8.4<br>SSDF:PS.1 | ci.yml: secrets | gitleaksの結果(JSON，キーは伏せ字)をCIのartifactとして保存 | 定常(変更ごと，コミットごと) | 自動 | [手順書](runbooks/secret-leak.md) |
| dependency-vulnerabilities | 依存関係の脆弱性検査 | 基盤運用 | ISO27001:A.8.8<br>SOC2:CC7.1<br>SSDF:PW.4 | ci.yml: sca | Trivyの結果(JSON)をCIのartifactとして保存 | 定常(変更ごと) | 自動 | [手順書](runbooks/exception-request.md) |
| exception-requests | 例外の申請と期限の管理 | 業務運用 | ISO27001:A.8.8<br>SOC2:CC3.4 | ci.yml: exceptions | exceptions.yaml の変更履歴(セキュリティ責任者が承認したプルリクエスト) | 非定常(申請のとき)と定常(変更ごとに期限を検査) | 人 | [手順書](runbooks/exception-request.md) |
