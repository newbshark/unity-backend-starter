using UnityEngine;

/// <summary>
/// Модуль 2: Общий Босс класса, Серверный Сундук, Монеты и Тест Античита!
/// Space = ударить Босса | L = открыть Сундук | E = взять +10 монет | C = чит +999999 (проверка защиты)
/// </summary>
public class WorldBossHitter : MonoBehaviour
{
    [Header("Впиши своё имя для таблицы лидеров!")]
    public string playerName = "Саша";
    public int hitDamage = 15;

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            ServerBridge.Instance.HitBoss(playerName, hitDamage, (boss) =>
            {
                transform.localScale *= 1.15f;
                Debug.Log($"<color=#f59e0b>[БОСС {boss.hp}/{boss.maxHp} HP]</color> {boss.lastEvent}");
            });
        }

        if (Input.GetKeyDown(KeyCode.L))
        {
            ServerBridge.Instance.OpenLootChest(playerName, (loot) =>
            {
                Color c;
                if (ColorUtility.TryParseHtmlString(loot.colorHex, out c))
                {
                    var rend = GetComponentInChildren<Renderer>();
                    if (rend != null) rend.material.color = c;
                }
                Debug.Log($"<color=#c084fc>[СУНДУК]</color> {loot.message}");
            });
        }

        if (Input.GetKeyDown(KeyCode.E))
        {
            ServerBridge.Instance.CollectCoin(playerName, 10, (res) =>
            {
                Debug.Log($"<color=#22c55e>[КОШЕЛЁК]</color> {res.message}");
            });
        }

        if (Input.GetKeyDown(KeyCode.C))
        {
            ServerBridge.Instance.CollectCoin(playerName, 999999, (res) =>
            {
                Debug.LogWarning($"<color=#ef4444>[ПОПЫТКА ВЗЛОМА]</color> accepted={res.accepted} | {res.message}");
            });
        }
    }
}
