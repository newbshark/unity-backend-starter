using UnityEngine;

/// <summary>
/// Модуль 2: Вешается на бегающего игрока (Player).
/// Не мешает WASD и прыжку на Space.
/// Показывает поверх экрана кликабельный Чеклист заданий от сервера, HP Босса и кошелёк!
/// F = Босс | L = Сундук | E = +10 монет | C = чит +999999 | Tab = разблокировать курсор
/// </summary>
public class WorldBossHitter : MonoBehaviour
{
    [Header("Впиши своё имя для таблицы лидеров и чеклиста!")]
    public string playerName = "Саша";
    public int hitDamage = 15;
    public bool showQuestOverlay = true;

    private Vector3 baseScale;
    private float syncTimer = 0f;

    private int bossHp = 100;
    private int bossMaxHp = 100;
    private int myCoins = 0;
    private string statusNote = "Жми F (Босс), L (Сундук), E (+10 мон.), C (Чит)";

    private string q1 = "1. Поставить ServerCube и увидеть смену режима";
    private string q2 = "2. Ударить Босса (F) и открыть сундук (L)";
    private string q3 = "3. Проверить Античит кнопкой C (+999999)";
    private bool q1Done = false;
    private bool q2Done = false;
    private bool q3Done = false;

    private void Awake()
    {
        baseScale = transform.localScale;
    }

    private void Start()
    {
        SyncHudFromServer();
    }

    private void Update()
    {
        transform.localScale = Vector3.Lerp(transform.localScale, baseScale, Time.deltaTime * 10f);

        if (Input.GetKeyDown(KeyCode.Tab))
        {
            bool locked = Cursor.lockState == CursorLockMode.Locked;
            Cursor.lockState = locked ? CursorLockMode.None : CursorLockMode.Locked;
            Cursor.visible = locked;
        }

        if (Input.GetKeyDown(KeyCode.F)) HitBossAction();
        if (Input.GetKeyDown(KeyCode.L)) OpenLootAction();
        if (Input.GetKeyDown(KeyCode.E)) CollectCoinAction(10);
        if (Input.GetKeyDown(KeyCode.C)) CollectCoinAction(999999);

        if (Input.GetKeyDown(KeyCode.Alpha1)) ToggleQuestAction("q1");
        if (Input.GetKeyDown(KeyCode.Alpha2)) ToggleQuestAction("q2");
        if (Input.GetKeyDown(KeyCode.Alpha3)) ToggleQuestAction("q3");

        syncTimer += Time.deltaTime;
        if (syncTimer >= 3f)
        {
            syncTimer = 0f;
            SyncHudFromServer();
        }
    }

    private void HitBossAction()
    {
        ServerBridge.Instance.HitBoss(playerName, hitDamage, (boss) =>
        {
            bossHp = boss.hp;
            bossMaxHp = boss.maxHp;
            transform.localScale = baseScale * 1.25f;
            statusNote = boss.lastEvent;
            Debug.Log($"<color=#f59e0b>[БОСС {boss.hp}/{boss.maxHp} HP]</color> {boss.lastEvent}");
        });
    }

    private void OpenLootAction()
    {
        ServerBridge.Instance.OpenLootChest(playerName, (loot) =>
        {
            transform.localScale = baseScale * 1.2f;
            statusNote = loot.message;
            Color c;
            if (ColorUtility.TryParseHtmlString(loot.colorHex, out c))
            {
                var rend = GetComponentInChildren<Renderer>();
                if (rend != null) rend.material.color = c;
            }
            Debug.Log($"<color=#c084fc>[СУНДУК]</color> {loot.message}");
        });
    }

    private void CollectCoinAction(int amount)
    {
        ServerBridge.Instance.CollectCoin(playerName, amount, (res) =>
        {
            myCoins = res.coins;
            statusNote = res.message;
            if (res.accepted)
            {
                transform.localScale = baseScale * 1.12f;
                Debug.Log($"<color=#22c55e>[КОШЕЛЁК]</color> {res.message}");
            }
            else
            {
                Debug.LogWarning($"<color=#ef4444>[ПОПЫТКА ВЗЛОМА]</color> {res.message}");
            }
        });
    }

    private void ToggleQuestAction(string qid)
    {
        ServerBridge.Instance.ToggleQuest(playerName, qid, (res) =>
        {
            ApplyQuestState(res);
            myCoins = res.coins;
            statusNote = res.message;
        });
    }

    private void SyncHudFromServer()
    {
        ServerBridge.Instance.GetBoss((b) =>
        {
            bossHp = b.hp;
            bossMaxHp = b.maxHp;
        });
        ServerBridge.Instance.GetQuests(playerName, ApplyQuestState);
    }

    private void ApplyQuestState(ServerBridge.QuestsResponse res)
    {
        if (!string.IsNullOrEmpty(res.q1)) q1 = res.q1;
        if (!string.IsNullOrEmpty(res.q2)) q2 = res.q2;
        if (!string.IsNullOrEmpty(res.q3)) q3 = res.q3;
        q1Done = res.q1Done;
        q2Done = res.q2Done;
        q3Done = res.q3Done;
    }

    private void OnGUI()
    {
        if (!showQuestOverlay) return;

        GUI.Box(new Rect(14, 14, 395, 250), $"СЕРВЕРНЫЙ ПЛАНШЕТ ({playerName})");
        GUI.Label(new Rect(26, 40, 370, 22), $"БОСС: {bossHp} / {bossMaxHp} HP   |   Монеты: {myCoins}");
        GUI.Label(new Rect(26, 62, 370, 36), statusNote);

        GUI.Label(new Rect(26, 102, 370, 20), "ЗАДАНИЯ ОТ УЧИТЕЛЯ (кликни или жми 1 / 2 / 3):");
        if (GUI.Button(new Rect(26, 126, 370, 32), (q1Done ? "[✓] " : "[ ] ") + q1)) ToggleQuestAction("q1");
        if (GUI.Button(new Rect(26, 162, 370, 32), (q2Done ? "[✓] " : "[ ] ") + q2)) ToggleQuestAction("q2");
        if (GUI.Button(new Rect(26, 198, 370, 32), (q3Done ? "[✓] " : "[ ] ") + q3)) ToggleQuestAction("q3");
        GUI.Label(new Rect(26, 236, 370, 20), "F=Удар | L=Сундук | E=+10мон | C=Чит | Tab=Курсор");
    }
}
