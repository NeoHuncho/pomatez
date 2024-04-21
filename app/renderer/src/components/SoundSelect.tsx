import React from "react";

import {
  StyledOptionContainer,
  StyledPlayButton,
  StyledSelectContainer,
} from "styles";

type Props = {
  id: string;
  label: string;
  name: string;
  options: string[];
  disabled?: boolean;
  onPlay: (sound: string) => void;
  onAddCustomSound: () => void;
};

export const SoundSelect: React.FC<Props> = ({
  id,
  label,
  name,
  options,
  disabled,
  onPlay,
  onAddCustomSound,
  ...props
}) => {
  return (
    <StyledSelectContainer {...props}>
      <label htmlFor={id}>{label}</label>
      {options.map((option, index) => (
        <StyledOptionContainer key={index}>
          <option value={option}>{option}</option>
          <StyledPlayButton onClick={() => onPlay(option)}>
            Play
          </StyledPlayButton>
        </StyledOptionContainer>
      ))}
      <button onClick={onAddCustomSound}>Add a custom sound</button>
    </StyledSelectContainer>
  );
};

SoundSelect.defaultProps = {};

export default React.memo(SoundSelect);
