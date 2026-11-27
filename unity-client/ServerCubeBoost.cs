using UnityEngine;
#if ENABLE_INPUT_SYSTEM && !ENABLE_LEGACY_INPUT_MANAGER
using UnityEngine.InputSystem;
#endif

/// <summary>
/// Модуль 1: «Тотем Сервера + Табло в небе».
/// Вешай на отдельный Cube посреди площади (ServerCube).
/// Меняет цвет, размер, скорость, взлетает при Луне и создаёт над собой 3D-текст с заданиями от учителя!
/// </summary>
public class ServerCubeBoost : MonoBehaviour
{
    public float baseSpinSpeed = 45f;
    public bool autoSyncEvery3Seconds = true;
    public bool spinObject = true;
    public bool floatOnMoonGravity = true;
    public bool show3DSkyText = true;

    private float currentMultiplier = 2f;
    private bool isLowGravity = false;
    private Vector3 targetScale = Vector3.one;
    private Vector3 basePosition;
    private float syncTimer = 0f;
    private int lastBossHp = -1;
    private float shakeTimer = 0f;

    private GameObject boardObj;
    private TextMesh skyTextMesh;

    private void Start()
    {
        basePosition = transform.position;
        if (show3DSkyText)
        {
            CreateFloatingSkyText();
        }
        SyncWorld();
    }

    private void CreateFloatingSkyText()
    {
        boardObj = new GameObject("ServerSkyBoard_3D");
        skyTextMesh = boardObj.AddComponent<TextMesh>();
        skyTextMesh.fontSize = 36;
        skyTextMesh.characterSize = 0.16f;
        skyTextMesh.anchor = TextAnchor.LowerCenter;
        skyTextMesh.alignment = TextAlignment.Center;
        skyTextMesh.color = Color.white;
        skyTextMesh.text = "Подключение к облаку...";
    }

    private void OnDestroy()
    {
        if (boardObj != null) Destroy(boardObj);
    }

    private void Update()
    {
        if (spinObject)
        {
            transform.Rotate(Vector3.up, baseSpinSpeed * currentMultiplier * Time.deltaTime);
        }

        transform.localScale = Vector3.Lerp(transform.localScale, targetScale, Time.deltaTime * 6f);

        float targetY = basePosition.y;
        if (floatOnMoonGravity && isLowGravity)
        {
            targetY = basePosition.y + 1.25f + Mathf.Sin(Time.time * 2.5f) * 0.35f;
        }

        float shakeX = 0f;
        if (shakeTimer > 0f)
        {
            shakeTimer -= Time.deltaTime;
            shakeX = Mathf.Sin(Time.time * 55f) * 0.18f;
        }

        Vector3 nextPos = new Vector3(basePosition.x + shakeX, targetY, basePosition.z);
        transform.position = Vector3.Lerp(transform.position, nextPos, Time.deltaTime * 8f);

        if (boardObj != null)
        {
            boardObj.transform.position = transform.position + Vector3.up * (transform.localScale.y * 0.7f + 0.9f);
            if (Camera.main != null)
            {
                boardObj.transform.forward = Camera.main.transform.forward;
            }
        }

        if (IsRPressed())
        {
            SyncWorld();
        }

        if (autoSyncEvery3Seconds)
        {
            syncTimer += Time.deltaTime;
            if (syncTimer >= 3f)
            {
                syncTimer = 0f;
                SyncWorld();
            }
        }
    }

    public void SyncWorld()
    {
        ServerBridge.Instance.GetWorldState((world) =>
        {
            currentMultiplier = world.expMultiplier;
            isLowGravity = world.lowGravity;

            if (lastBossHp != -1 && world.bossHp < lastBossHp)
            {
                shakeTimer = 0.4f;
            }
            lastBossHp = world.bossHp;

            float s = Mathf.Clamp(world.cubeScale, 0.3f, 4f);
            targetScale = new Vector3(s, s, s);
            Physics.gravity = new Vector3(0f, world.gravityY, 0f);

            Color parsedColor = Color.yellow;
            if (!string.IsNullOrEmpty(world.cubeColorHex))
            {
                ColorUtility.TryParseHtmlString(world.cubeColorHex, out parsedColor);
            }

            var rend3D = GetComponentInChildren<Renderer>();
            if (rend3D != null) rend3D.material.color = parsedColor;

            var rend2D = GetComponentInChildren<SpriteRenderer>();
            if (rend2D != null) rend2D.color = parsedColor;

            if (skyTextMesh != null)
            {
                string modeLabel = world.lowGravity ? "ЛУНА" : "ЗЕМЛЯ";
                skyTextMesh.text =
                    $"[{world.title}] x{world.expMultiplier} ({modeLabel})\n" +
                    $"{world.motd}\n" +
                    $"БОСС: {world.bossHp}/{world.bossMaxHp} HP";
            }
        });
    }

    private bool IsRPressed()
    {
#if ENABLE_INPUT_SYSTEM && !ENABLE_LEGACY_INPUT_MANAGER
        return Keyboard.current != null && Keyboard.current.rKey.wasPressedThisFrame;
#else
        return Input.GetKeyDown(KeyCode.R);
#endif
    }
}
