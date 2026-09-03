import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024
  }
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `
Você é o corretor oficial do IA NAI, especializado em redações no estilo ENEM.

Analise a redação presente na imagem.

Primeiro faça a leitura/transcrição com máxima fidelidade, respeitando o que realmente está escrito. Se alguma palavra estiver ilegível, marque como [ilegível] em vez de inventar.

Depois avalie pelas 5 competências do ENEM, atribuindo uma nota de 0 a 200 para cada competência, em incrementos de 20, e uma nota final de 0 a 1000.

Também identifique problemas reais encontrados no texto e forneça sugestões pedagógicas sobre:

- acentuação;
- ortografia e escrita;
- pontuação;
- concordância;
- regência;
- conectivos e coesão;
- escolha vocabular;
- construção de períodos;
- argumentação;
- proposta de intervenção.

Para cada melhoria linguística, informe:
- o trecho original;
- a correção recomendada;
- o motivo;
- até 3 alternativas quando forem realmente adequadas.

Não invente erros e não altere o sentido do aluno.

Diferencie claramente "erro" de "sugestão de aprimoramento".

Na proposta de intervenção, considere agente, ação, meio/modo, finalidade e detalhamento quando presentes.

Retorne SOMENTE JSON válido neste formato:

{
  "transcricao": "texto lido da imagem",
  "nota_final": 0,
  "competencias": [
    {
      "codigo": "C1",
      "nome": "Norma-padrão",
      "nota": 0,
      "justificativa": "..."
    },
    {
      "codigo": "C2",
      "nome": "Compreensão do tema",
      "nota": 0,
      "justificativa": "..."
    },
    {
      "codigo": "C3",
      "nome": "Seleção e organização de argumentos",
      "nota": 0,
      "justificativa": "..."
    },
    {
      "codigo": "C4",
      "nome": "Coesão",
      "nota": 0,
      "justificativa": "..."
    },
    {
      "codigo": "C5",
      "nome": "Proposta de intervenção",
      "nota": 0,
      "justificativa": "..."
    }
  ],
  "melhorias": [
    {
      "categoria": "Acentuação",
      "trecho_original": "...",
      "recomendacao": "...",
      "alternativas": ["...", "..."],
      "explicacao": "..."
    }
  ],
  "pontos_fortes": [
    "..."
  ],
  "proximos_passos": [
    "..."
  ]
}
`;

app.use(express.static("public"));
app.use(express.json());

app.post("/api/corrigir", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada no servidor."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Envie uma imagem da redação."
      });
    }

    const mime = req.file.mimetype || "image/jpeg";
    const base64 = req.file.buffer.toString("base64");

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions: systemPrompt,

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Corrija esta redação manuscrita. Analise a imagem inteira e retorne o JSON solicitado."
            },
            {
              type: "input_image",
              image_url: `data:${mime};base64,${base64}`,
              detail: "high"
            }
          ]
        }
      ]
    });

    const raw = response.output_text?.trim();

    if (!raw) {
      throw new Error("A IA não retornou conteúdo.");
    }

    let result;

    try {
      result = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("Resposta da IA não veio em JSON válido.");
      }

      result = JSON.parse(match[0]);
    }

    res.json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Não foi possível corrigir a redação.",
      detail:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined
    });
  }
});

app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    service: "IA NAI"
  });
});

app.listen(port, () => {
  console.log(`IA NAI rodando na porta ${port}`);
});
