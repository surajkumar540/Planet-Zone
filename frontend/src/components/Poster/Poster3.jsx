
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Poster3 = () => {
  const navigate = useNavigate();
  const navigate = useNavigate();

  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: "flex",
          height: { xs: "auto", md: "540px" },
          borderRadius: "32px",
          overflow: "hidden",
          flexDirection: { xs: "column", md: "row" },
          boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
        }}
      >
        {/* ── LEFT — Deep Forest Visual Panel ── */}
        <Box
          sx={{
            flex: { md: "0 0 48%" },
            background: "linear-gradient(145deg, #0A3D0A 0%, #1B5E20 45%, #2E7D32 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: "380px", md: "auto" },
            p: { xs: 4, md: 6 },
          }}
        >
          {/* Subtle dot grid */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.07,
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Diagonal accent stripe */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "55%",
              height: "100%",
              background:
                "linear-gradient(160deg, rgba(76,175,80,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Ghost word */}
          <Typography
            sx={{
              position: "absolute",
              fontSize: { xs: "100px", md: "160px" },
              fontWeight: 900,
              color: "rgba(255,255,255,0.03)",
              fontFamily: "'Cormorant Garamond', serif",
              bottom: "-10px",
              left: "-10px",
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            PURE
          </Typography>

          {/* Central Badge Composition */}
          <Box
            sx={{
              position: "relative",
              width: { xs: 220, md: 260 },
              height: { xs: 220, md: 260 },
              zIndex: 2,
            }}
          >
            {/* Outer thin ring */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1px solid rgba(129,199,132,0.25)",
              }}
            />
            {/* Dashed spinning ring */}
            <Box
              sx={{
                position: "absolute",
                inset: 16,
                borderRadius: "50%",
                border: "1.5px dashed rgba(129,199,132,0.4)",
                animation: "rotateSlow 50s linear infinite",
                "@keyframes rotateSlow": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
            {/* Inner frosted glass disk */}
            <Box
              sx={{
                position: "absolute",
                inset: 36,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                boxShadow:
                  "0 0 60px rgba(76,175,80,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: { xs: "40px", md: "50px" },
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                100%
              </Typography>
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#A5D6A7",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                }}
              >
                Organic
              </Typography>
            </Box>

            {/* Orbit dots */}
            {[0, 90, 180, 270].map((deg) => (
              <Box
                key={deg}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 8,
                  height: 8,
                  bgcolor: "#66BB6A",
                  borderRadius: "50%",
                  transform: `rotate(${deg}deg) translateX(126px) translateY(-50%)`,
                  boxShadow: "0 0 8px rgba(102,187,106,0.8)",
                }}
              />
            ))}
          </Box>

          {/* Stats Row */}
          <Box
            sx={{
              position: "absolute",
              bottom: 36,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: { xs: 4, md: 6 },
            }}
          >
            {[
              { num: "500+", label: "Products" },
              { num: "12K+", label: "Customers" },
              { num: "5★", label: "Rating" },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: { xs: "18px", md: "22px" },
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {stat.num}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    mt: 0.4,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
  return (
    <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          display: "flex",
          height: { xs: "auto", md: "540px" },
          borderRadius: "32px",
          overflow: "hidden",
          flexDirection: { xs: "column", md: "row" },
          boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
        }}
      >
        {/* ── LEFT — Deep Forest Visual Panel ── */}
        <Box
          sx={{
            flex: { md: "0 0 48%" },
            background: "linear-gradient(145deg, #0A3D0A 0%, #1B5E20 45%, #2E7D32 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: "380px", md: "auto" },
            p: { xs: 4, md: 6 },
          }}
        >
          {/* Subtle dot grid */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.07,
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Diagonal accent stripe */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "55%",
              height: "100%",
              background:
                "linear-gradient(160deg, rgba(76,175,80,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Ghost word */}
          <Typography
            sx={{
              position: "absolute",
              fontSize: { xs: "100px", md: "160px" },
              fontWeight: 900,
              color: "rgba(255,255,255,0.03)",
              fontFamily: "'Cormorant Garamond', serif",
              bottom: "-10px",
              left: "-10px",
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            PURE
          </Typography>

          {/* Central Badge Composition */}
          <Box
            sx={{
              position: "relative",
              width: { xs: 220, md: 260 },
              height: { xs: 220, md: 260 },
              zIndex: 2,
            }}
          >
            {/* Outer thin ring */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1px solid rgba(129,199,132,0.25)",
              }}
            />
            {/* Dashed spinning ring */}
            <Box
              sx={{
                position: "absolute",
                inset: 16,
                borderRadius: "50%",
                border: "1.5px dashed rgba(129,199,132,0.4)",
                animation: "rotateSlow 50s linear infinite",
                "@keyframes rotateSlow": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
            {/* Inner frosted glass disk */}
            <Box
              sx={{
                position: "absolute",
                inset: 36,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                boxShadow:
                  "0 0 60px rgba(76,175,80,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: { xs: "40px", md: "50px" },
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                100%
              </Typography>
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "#A5D6A7",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                }}
              >
                Organic
              </Typography>
            </Box>

            {/* Orbit dots */}
            {[0, 90, 180, 270].map((deg) => (
              <Box
                key={deg}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 8,
                  height: 8,
                  bgcolor: "#66BB6A",
                  borderRadius: "50%",
                  transform: `rotate(${deg}deg) translateX(126px) translateY(-50%)`,
                  boxShadow: "0 0 8px rgba(102,187,106,0.8)",
                }}
              />
            ))}
          </Box>

          {/* Stats Row */}
          <Box
            sx={{
              position: "absolute",
              bottom: 36,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: { xs: 4, md: 6 },
            }}
          >
            {[
              { num: "500+", label: "Products" },
              { num: "12K+", label: "Customers" },
              { num: "5★", label: "Rating" },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: { xs: "18px", md: "22px" },
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {stat.num}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    mt: 0.4,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── RIGHT — Content Panel ── */}
        <Box
          sx={{
            flex: { md: "0 0 52%" },
            background: "linear-gradient(150deg, #FFF8E7 0%, #FFF3CD 50%, #FFF8E7 100%)",
            display: "flex",
            alignItems: "center",
            px: { xs: 4, md: 8 },
            py: { xs: 6, md: 0 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Amber decorative circle top-right */}
          <Box
            sx={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(249,168,37,0.18) 0%, transparent 70%)",
            }}
          />
          {/* Small accent circle bottom-left */}
          <Box
            sx={{
              position: "absolute",
              bottom: -50,
              left: -50,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(249,168,37,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Thin vertical accent line */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "15%",
              bottom: "15%",
              width: "3px",
              borderRadius: "0 4px 4px 0",
              background: "linear-gradient(to bottom, transparent, #F9A825, transparent)",
              opacity: 0.6,
            }}
          />

          <Box sx={{ zIndex: 2, maxWidth: 420, width: "100%" }}>
            {/* Eyebrow badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(249,168,37,0.15)",
                color: "#7B5800",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                px: 2,
                py: 0.8,
                borderRadius: "50px",
                border: "1px solid rgba(249,168,37,0.4)",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  bgcolor: "#F9A825",
                  borderRadius: "50%",
                  boxShadow: "0 0 6px rgba(249,168,37,0.8)",
                }}
              />
              Sustainable Farming
            </Box>

            {/* Headline */}
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "42px", md: "58px" },
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#1A2F1A",
                mb: 0.5,
              }}
            >
              Freshness
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "42px", md: "58px" },
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#F9A825",
                fontStyle: "italic",
                mb: 3,
              }}
            >
              Guaranteed.
            </Typography>

            {/* Divider */}
            <Box
              sx={{
                width: 48,
                height: 3,
                bgcolor: "#3CB815",
                borderRadius: "2px",
                mb: 3,
              }}
            />

            {/* Description */}
            <Typography
              sx={{
                fontSize: "15px",
                color: "#4A4A4A",
                lineHeight: 1.75,
                mb: 4,
                maxWidth: 340,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              From our farms directly to your table. Every product is ethically
              sourced, free from harmful chemicals, and packed at peak freshness.
            </Typography>

            {/* Feature tags */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
              {[
                { label: "No Chemicals", color: "#E8F5E9", text: "#2E7D32" },
                { label: "Locally Grown", color: "#FFF8E1", text: "#F57F17" },
                { label: "Hand Picked", color: "#F3E5F5", text: "#6A1B9A" },
              ].map((tag) => (
                <Box
                  key={tag.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    bgcolor: tag.color,
                    color: tag.text,
                    fontSize: "11px",
                    fontWeight: 700,
                    px: 1.8,
                    py: 0.7,
                    borderRadius: "8px",
                    letterSpacing: "0.03em",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: tag.text,
                      borderRadius: "50%",
                      opacity: 0.7,
                    }}
                  />
                  {tag.label}
                </Box>
              ))}
            </Box>
        {/* ── RIGHT — Content Panel ── */}
        <Box
          sx={{
            flex: { md: "0 0 52%" },
            background: "linear-gradient(150deg, #FFF8E7 0%, #FFF3CD 50%, #FFF8E7 100%)",
            display: "flex",
            alignItems: "center",
            px: { xs: 4, md: 8 },
            py: { xs: 6, md: 0 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Amber decorative circle top-right */}
          <Box
            sx={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(249,168,37,0.18) 0%, transparent 70%)",
            }}
          />
          {/* Small accent circle bottom-left */}
          <Box
            sx={{
              position: "absolute",
              bottom: -50,
              left: -50,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(249,168,37,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Thin vertical accent line */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "15%",
              bottom: "15%",
              width: "3px",
              borderRadius: "0 4px 4px 0",
              background: "linear-gradient(to bottom, transparent, #F9A825, transparent)",
              opacity: 0.6,
            }}
          />

          <Box sx={{ zIndex: 2, maxWidth: 420, width: "100%" }}>
            {/* Eyebrow badge */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(249,168,37,0.15)",
                color: "#7B5800",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                px: 2,
                py: 0.8,
                borderRadius: "50px",
                border: "1px solid rgba(249,168,37,0.4)",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  bgcolor: "#F9A825",
                  borderRadius: "50%",
                  boxShadow: "0 0 6px rgba(249,168,37,0.8)",
                }}
              />
              Sustainable Farming
            </Box>

            {/* Headline */}
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "42px", md: "58px" },
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#1A2F1A",
                mb: 0.5,
              }}
            >
              Freshness
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: { xs: "42px", md: "58px" },
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#F9A825",
                fontStyle: "italic",
                mb: 3,
              }}
            >
              Guaranteed.
            </Typography>

            {/* Divider */}
            <Box
              sx={{
                width: 48,
                height: 3,
                bgcolor: "#3CB815",
                borderRadius: "2px",
                mb: 3,
              }}
            />

            {/* Description */}
            <Typography
              sx={{
                fontSize: "15px",
                color: "#4A4A4A",
                lineHeight: 1.75,
                mb: 4,
                maxWidth: 340,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              From our farms directly to your table. Every product is ethically
              sourced, free from harmful chemicals, and packed at peak freshness.
            </Typography>

            {/* Feature tags */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
              {[
                { label: "No Chemicals", color: "#E8F5E9", text: "#2E7D32" },
                { label: "Locally Grown", color: "#FFF8E1", text: "#F57F17" },
                { label: "Hand Picked", color: "#F3E5F5", text: "#6A1B9A" },
              ].map((tag) => (
                <Box
                  key={tag.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    bgcolor: tag.color,
                    color: tag.text,
                    fontSize: "11px",
                    fontWeight: 700,
                    px: 1.8,
                    py: 0.7,
                    borderRadius: "8px",
                    letterSpacing: "0.03em",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      bgcolor: tag.text,
                      borderRadius: "50%",
                      opacity: 0.7,
                    }}
                  />
                  {tag.label}
                </Box>
              ))}
            </Box>

            {/* CTA */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/shop")}
                sx={{
                  bgcolor: "#1B5E20",
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  px: 4,
                  py: 1.5,
                  borderRadius: "14px",
                  textTransform: "none",
                  boxShadow: "0 8px 24px rgba(27,94,32,0.3)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    bgcolor: "#2E7D32",
                    transform: "translateY(-3px)",
                    boxShadow: "0 14px 32px rgba(27,94,32,0.35)",
                  },
                }}
              >
                Shop Now →
              </Button>

              <Typography
                onClick={() => navigate("/about")}
                sx={{
                  fontSize: "13px",
                  color: "#7B7B7B",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  "&:hover": { color: "#1B5E20" },
                  transition: "color 0.2s",
                }}
              >
                Learn More
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
            {/* CTA */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/shop")}
                sx={{
                  bgcolor: "#1B5E20",
                  color: "#fff",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  px: 4,
                  py: 1.5,
                  borderRadius: "14px",
                  textTransform: "none",
                  boxShadow: "0 8px 24px rgba(27,94,32,0.3)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    bgcolor: "#2E7D32",
                    transform: "translateY(-3px)",
                    boxShadow: "0 14px 32px rgba(27,94,32,0.35)",
                  },
                }}
              >
                Shop Now →
              </Button>

              <Typography
                onClick={() => navigate("/about")}
                sx={{
                  fontSize: "13px",
                  color: "#7B7B7B",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  "&:hover": { color: "#1B5E20" },
                  transition: "color 0.2s",
                }}
              >
                Learn More
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Poster3;
