using UnityEngine;

/// <summary>
/// Модуль 2: Вешается прямо на твоего бегающего игрока (Player)!
/// Не мешает WASD и прыжку на Space.
/// F = ударить Босса | L = открыть Сундук | E = +10 монет | C = чит +999999 (проверка Античита)
/// </summary>
public class WorldBossHitter : MonoBehaviour
{
    [Header("Впиши своё имя для таблицы лидеров!")]
    public string playerName = "Саша";
    public int hitDamage = 15;

    private Vector3 baseScale;

    private void Awake()
    {
        baseScale = transform.localScale;
    }

    private void Update()
    {
        transform.localScale = Vector3.Lerp(transform.localScale, baseScale, Time.deltaTime * 10f);

        if (Input.GetKeyDown(KeyCode.F))
        {
            ServerBridge.Instance.HitBoss(playerName, hitDamage, (boss) =>
            {
                transform.localScale = baseScale * 1.25f;
                Debug.Log($"<color=#f59e0b>[БОСС {boss.hp}/{boss.maxHp} HP]</color> {boss.lastEvent}");
            });
        }

        if (Input.GetKeyDown(KeyCode.L))
        {
            ServerBridge.Instance.OpenLootChest(playerName, (loot) =>
            {
                transform.localScale = baseScale * 1.2f;
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
                transform.localScale = baseScale * 1.12f;
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
